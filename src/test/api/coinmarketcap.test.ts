import { describe, expect, it, vi } from 'vitest';

import { fakeFirestore, fakeResponse, requireApi } from '../../../api/_lib/helpers';

type Handler = (req: unknown, res: ReturnType<typeof fakeResponse>) => Promise<void>;
type CreateHandler = (deps: Record<string, unknown>) => Handler;
type Coin = {
	cmc_rank: null | number;
	id: number;
	name: string;
	quote: Record<string, { price: number }>;
	slug: string;
};
type Body = { data: Array<Coin> | null; status: { error_code: number; stale?: boolean } };
type Tracked = Record<string, number>;
type CacheDoc = {
	coins: Array<Coin>;
	credits: { month: string; used: number };
	timestamp: number;
	tracked: Tracked;
};

const { createHandler } = requireApi('./coinmarketcap.js') as { createHandler: CreateHandler };
const listings = requireApi('./_lib/listings.js') as {
	ADDITIONAL_COIN_IDS: Array<number>;
	combineListings: (usd: Array<unknown>, eur: Array<unknown>) => Array<Coin>;
	FORGET_AFTER_MS: number;
	MAX_EXTRA_COINS: number;
	selectExtraIds: (topIds: Array<number>, tracked: Tracked) => Array<number>;
	updateTracked: (tracked: Tracked, pricedIds: Array<number>, now: number) => Tracked;
};
const {
	ADDITIONAL_COIN_IDS,
	combineListings,
	FORGET_AFTER_MS,
	MAX_EXTRA_COINS,
	selectExtraIds,
	updateTracked,
} = listings;

const NOW = Date.UTC(2026, 9, 13, 12, 0, 0);
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const CACHE_KEY = 'cachedData/latest';

/** A coin as CoinMarketCap returns it, with plenty of fields the app doesn't need. */
const cmcCoin = (id: number, currency: string, price: number) => ({
	circulating_supply: 19_000_000,
	cmc_rank: id,
	id,
	name: `Coin ${String(id)}`,
	quote: { [currency]: { market_cap: 1e12, percent_change_24h: 1.5, price, volume_24h: 1e9 } },
	slug: `coin-${String(id)}`,
	tags: ['mineable', 'pow'],
});

type Params = { convert: string; id?: string; skip_invalid?: boolean };
type CoinMarketCapGet = (path: string, params: Params) => Promise<unknown>;

/** Fakes CoinMarketCap: the top list, plus quotes for any requested coin that isn't delisted. */
const fakeCoinMarketCap = (topIds: Array<number>, { delisted = [] as Array<number> } = {}) =>
	vi.fn<CoinMarketCapGet>((path, params) => {
		const price = params.convert === 'EUR' ? 900 : 1000;
		const status = { credit_count: 1, error_code: 0 };
		if (path === 'cryptocurrency/listings/latest') {
			return Promise.resolve({
				data: topIds.map((id) => cmcCoin(id, params.convert, price)),
				status,
			});
		}
		const ids = (params.id ?? '')
			.split(',')
			.map(Number)
			.filter((id) => !delisted.includes(id));
		return Promise.resolve({
			data: Object.fromEntries(ids.map((id) => [id, cmcCoin(id, params.convert, price)])),
			status,
		});
	});

const quoteIds = (mock: ReturnType<typeof fakeCoinMarketCap>) =>
	mock.mock.calls
		.find(([path]) => path === 'cryptocurrency/quotes/latest')?.[1]
		.id?.split(',')
		.map(Number) ?? [];

const request = (extra: Record<string, unknown> = {}) => ({
	headers: { origin: 'https://gotcrypto.vercel.app' },
	method: 'GET',
	query: {},
	...extra,
});

type RunOptions = {
	at?: number;
	budget?: number;
	cached?: Partial<CacheDoc> | Record<string, unknown>;
	coinMarketCap?: CoinMarketCapGet;
};

const run = async ({
	at = NOW,
	budget = 14000,
	cached,
	coinMarketCap = fakeCoinMarketCap([1, 2, 3]),
}: RunOptions = {}) => {
	const firestore = fakeFirestore(cached ? { [CACHE_KEY]: cached } : {});
	const handler = createHandler({
		budget: () => budget,
		coinMarketCap,
		getFirestore: () => firestore.db,
		now: () => at,
	});
	const res = fakeResponse();
	await handler(request(), res);
	return {
		body: res.body as Body,
		coinMarketCap,
		res,
		saved: firestore.store.get(CACHE_KEY) as CacheDoc | undefined,
		writes: firestore.writes,
	};
};

const someCoins = combineListings([cmcCoin(1, 'USD', 1)], [cmcCoin(1, 'EUR', 1)]);

describe('combineListings', () => {
	it('keeps only the fields the app uses', () => {
		const [coin] = combineListings([cmcCoin(1, 'USD', 1000)], [cmcCoin(1, 'EUR', 900)]);

		expect(coin).toEqual({
			cmc_rank: 1,
			id: 1,
			name: 'Coin 1',
			quote: { EUR: { price: 900 }, USD: { price: 1000 } },
			slug: 'coin-1',
		});
	});

	it('leaves out a coin without a price in both currencies', () => {
		const coins = combineListings(
			[cmcCoin(1, 'USD', 1000), cmcCoin(2, 'USD', 5)],
			[cmcCoin(1, 'EUR', 900)]
		);

		expect(coins.map((coin) => coin.id)).toEqual([1]);
	});
});

describe('selectExtraIds', () => {
	it('puts the always-included coins first, then remembered coins, most recent first', () => {
		const ids = selectExtraIds([1], { 500: NOW - 2 * DAY, 600: NOW - DAY });
		const always = ADDITIONAL_COIN_IDS.filter((id) => id !== 1);

		expect(ids).toEqual([...always, 600, 500]);
	});

	it('never asks for more than fits in one request per currency', () => {
		const tracked = Object.fromEntries(
			Array.from({ length: 300 }, (_, i) => [10_000 + i, NOW - i * MINUTE])
		);
		const ids = selectExtraIds([], tracked);

		expect(ids).toHaveLength(MAX_EXTRA_COINS);
		expect(ids.slice(0, ADDITIONAL_COIN_IDS.length)).toEqual(ADDITIONAL_COIN_IDS);
		expect(ids.at(-1)).toBe(10_000 + MAX_EXTRA_COINS - ADDITIONAL_COIN_IDS.length - 1); // the most recent ones
	});
});

describe('updateTracked', () => {
	it('remembers every priced coin and forgets coins without a price for 30 days', () => {
		const tracked = { 500: NOW - FORGET_AFTER_MS - 1, 600: NOW - FORGET_AFTER_MS + DAY };

		expect(updateTracked(tracked, [1, 2], NOW)).toEqual({
			1: NOW,
			2: NOW,
			600: NOW - FORGET_AFTER_MS + DAY,
		});
	});
});

describe('GET /api/coinmarketcap', () => {
	it('fetches fresh prices, stores them and lets the CDN serve them for 15 minutes', async () => {
		const { body, res, writes } = await run();

		expect(res.statusCode).toBe(200);
		expect(body.status).toMatchObject({ error_code: 0, stale: false });
		expect(writes).toEqual([CACHE_KEY]);
		expect(res.headers['cache-control']).toMatch(/s-maxage=900/);
	});

	it('serves recent prices from Firestore without calling CoinMarketCap', async () => {
		const { body, coinMarketCap, res } = await run({
			cached: { coins: someCoins, timestamp: NOW - 4 * MINUTE },
		});

		expect(body.data).toEqual(someCoins);
		expect(coinMarketCap).not.toHaveBeenCalled();
		expect(res.headers['cache-control']).toMatch(/s-maxage=660/); // 11 minutes left
	});

	it('refreshes prices older than 15 minutes', async () => {
		const { coinMarketCap } = await run({
			cached: { coins: someCoins, timestamp: NOW - 16 * MINUTE },
		});

		expect(coinMarketCap).toHaveBeenCalled();
	});

	describe('coins outside the top list', () => {
		it('keeps the price of a coin that fell out of the top list', async () => {
			// First refresh: coin 999 is in the top list
			const first = await run({ coinMarketCap: fakeCoinMarketCap([1, 999]) });
			// Next refresh: it isn't anymore
			const second = await run({
				at: NOW + 20 * MINUTE,
				cached: first.saved,
				coinMarketCap: fakeCoinMarketCap([1, 2]),
			});

			expect(second.body.data?.map((coin) => coin.id)).toContain(999);
		});

		it('asks CoinMarketCap to skip delisted coins instead of failing the whole request', async () => {
			const coinMarketCap = fakeCoinMarketCap([1], { delisted: [999] });
			const { body } = await run({
				cached: { coins: someCoins, timestamp: NOW - DAY, tracked: { 999: NOW - DAY } },
				coinMarketCap,
			});

			const quoteCall = coinMarketCap.mock.calls.find(
				([path]) => path === 'cryptocurrency/quotes/latest'
			);
			expect(quoteCall?.[1].skip_invalid).toBe(true);
			expect(body.data?.map((coin) => coin.id)).not.toContain(999);
		});

		it('forgets a delisted coin after 30 days without a price', async () => {
			const lastPriced = NOW - FORGET_AFTER_MS - MINUTE;
			const { saved } = await run({
				cached: { coins: someCoins, timestamp: NOW - DAY, tracked: { 999: lastPriced } },
				coinMarketCap: fakeCoinMarketCap([1], { delisted: [999] }),
			});

			expect(saved?.tracked).not.toHaveProperty('999');
		});

		it('requests at most 100 extra coins, so each refresh costs 4 credits', async () => {
			const tracked = Object.fromEntries(
				Array.from({ length: 250 }, (_, i) => [20_000 + i, NOW - i * MINUTE])
			);
			const coinMarketCap = fakeCoinMarketCap([1]);
			const { saved } = await run({
				cached: { coins: someCoins, timestamp: NOW - DAY, tracked },
				coinMarketCap,
			});

			expect(quoteIds(coinMarketCap)).toHaveLength(MAX_EXTRA_COINS);
			expect(coinMarketCap).toHaveBeenCalledTimes(4);
			expect(saved?.credits.used).toBe(4);
		});
	});

	describe('monthly credit budget', () => {
		it('counts the credits CoinMarketCap reports, per month', async () => {
			const { saved } = await run({
				cached: {
					coins: someCoins,
					credits: { month: '2026-10', used: 100 },
					timestamp: NOW - DAY,
				},
			});

			expect(saved?.credits).toEqual({ month: '2026-10', used: 104 });
		});

		it('starts counting from zero in a new month', async () => {
			const { saved } = await run({
				cached: {
					coins: someCoins,
					credits: { month: '2026-09', used: 13_999 },
					timestamp: NOW - DAY,
				},
			});

			expect(saved?.credits).toEqual({ month: '2026-10', used: 4 });
		});

		it('stops refreshing when the budget is used up and serves stored prices', async () => {
			const { body, coinMarketCap, res } = await run({
				budget: 14_000,
				cached: {
					coins: someCoins,
					credits: { month: '2026-10', used: 14_000 },
					timestamp: NOW - DAY,
				},
			});

			expect(coinMarketCap).not.toHaveBeenCalled();
			expect(body.data).toEqual(someCoins);
			expect(body.status.stale).toBe(true);
			expect(res.headers['cache-control']).toMatch(/s-maxage=1800/);
		});

		it('reports unavailable prices when the budget is used up and nothing is stored', async () => {
			const { coinMarketCap, res } = await run({
				cached: { credits: { month: '2026-10', used: 20_000 } },
			});

			expect(coinMarketCap).not.toHaveBeenCalled();
			expect(res.statusCode).toBe(503);
		});

		it('still counts credits spent before CoinMarketCap failed halfway', async () => {
			const halfway = vi.fn<CoinMarketCapGet>((path) =>
				path === 'cryptocurrency/listings/latest'
					? Promise.resolve({ data: [cmcCoin(1, 'USD', 1)], status: { credit_count: 1 } })
					: Promise.reject(new Error('Request failed with status code 500'))
			);
			const { body, saved } = await run({
				cached: { coins: someCoins, credits: { month: '2026-10', used: 10 }, timestamp: NOW - DAY },
				coinMarketCap: halfway,
			});

			expect(body.status.stale).toBe(true);
			expect(saved?.credits).toEqual({ month: '2026-10', used: 12 }); // the two listing calls
			expect(saved?.coins).toEqual(someCoins); // stored prices untouched
		});
	});

	it('serves the last good prices, marked as stale, when CoinMarketCap fails', async () => {
		const { body, res, writes } = await run({
			cached: { coins: someCoins, timestamp: NOW - 3 * 60 * MINUTE },
			coinMarketCap: vi.fn<CoinMarketCapGet>(() =>
				Promise.reject(new Error('Request failed with status code 429'))
			),
		});

		expect(res.statusCode).toBe(200);
		expect(body.status.stale).toBe(true);
		expect(writes).toEqual([]); // nothing was spent, so nothing to record
		expect(res.headers['cache-control']).toMatch(/s-maxage=60\b/);
	});

	it('reports an error the frontend understands when there is nothing to fall back on', async () => {
		const { body, res } = await run({
			coinMarketCap: vi.fn<CoinMarketCapGet>(() => Promise.reject(new Error('down'))),
		});

		expect(res.statusCode).toBe(502);
		expect(body).toMatchObject({ data: null, status: { error_code: 502 } });
	});

	it('replaces a cache document in the old format', async () => {
		const { coinMarketCap, saved } = await run({
			cached: { apiResponse: { data: [] }, timestamp: NOW - MINUTE },
		});

		expect(coinMarketCap).toHaveBeenCalled();
		expect(saved).toMatchObject({ timestamp: NOW });
	});

	it('still serves prices when Firestore is unavailable', async () => {
		const handler = createHandler({
			budget: () => 14000,
			coinMarketCap: fakeCoinMarketCap([1]),
			getFirestore: () => {
				throw new Error('Missing Firebase environment variables');
			},
			now: () => NOW,
		});
		const res = fakeResponse();

		await handler(request(), res);

		expect(res.statusCode).toBe(200);
	});

	it('refuses methods other than GET', async () => {
		const firestore = fakeFirestore();
		const handler = createHandler({
			coinMarketCap: fakeCoinMarketCap([1]),
			getFirestore: () => firestore.db,
			now: () => NOW,
		});
		const res = fakeResponse();

		await handler(request({ method: 'DELETE' }), res);

		expect(res.statusCode).toBe(405);
	});
});
