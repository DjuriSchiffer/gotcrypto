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

const { createHandler } = requireApi('./coinmarketcap.js') as { createHandler: CreateHandler };
const { ADDITIONAL_COIN_IDS, combineListings } = requireApi('./_lib/listings.js') as {
	ADDITIONAL_COIN_IDS: Array<number>;
	combineListings: (usd: Array<unknown>, eur: Array<unknown>) => Array<Coin>;
};

const NOW = Date.UTC(2026, 9, 13, 12, 0, 0);
const MINUTE = 60 * 1000;
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

type CoinMarketCapGet = (
	path: string,
	params: { convert: string; id?: string }
) => Promise<unknown>;

/** Fakes CoinMarketCap: every requested coin exists, in the requested currency. */
const fakeCoinMarketCap = (topIds: Array<number>) =>
	vi.fn<CoinMarketCapGet>((path, params) => {
		const price = params.convert === 'EUR' ? 900 : 1000;
		if (path === 'cryptocurrency/listings/latest') {
			return Promise.resolve({ data: topIds.map((id) => cmcCoin(id, params.convert, price)) });
		}
		const ids = (params.id ?? '').split(',').map(Number);
		return Promise.resolve({
			data: Object.fromEntries(ids.map((id) => [id, cmcCoin(id, params.convert, price)])),
		});
	});

const request = (extra: Record<string, unknown> = {}) => ({
	headers: { origin: 'https://gotcrypto.vercel.app' },
	method: 'GET',
	query: {},
	...extra,
});

type RunOptions = {
	cached?: Record<string, unknown>;
	coinMarketCap?: CoinMarketCapGet;
};

const run = async ({
	cached = {},
	coinMarketCap = fakeCoinMarketCap([1, 2, 3]),
}: RunOptions = {}) => {
	const firestore = fakeFirestore(cached);
	const handler = createHandler({
		coinMarketCap,
		getFirestore: () => firestore.db,
		now: () => NOW,
	});
	const res = fakeResponse();
	await handler(request(), res);
	return { body: res.body as Body, coinMarketCap, firestore, res };
};

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

describe('GET /api/coinmarketcap', () => {
	it('fetches fresh prices, stores them and lets the CDN serve them for 10 minutes', async () => {
		const { body, firestore, res } = await run();

		expect(res.statusCode).toBe(200);
		expect(body.status).toMatchObject({ error_code: 0, stale: false });
		expect(firestore.writes).toEqual([CACHE_KEY]);
		expect(res.headers['cache-control']).toMatch(/s-maxage=600/);
	});

	it('always includes the extra coins outside the top list', async () => {
		const { body, coinMarketCap } = await run({ coinMarketCap: fakeCoinMarketCap([1, 2, 3]) });

		const ids = body.data?.map((coin) => coin.id) ?? [];
		for (const id of ADDITIONAL_COIN_IDS) expect(ids).toContain(id);
		// 2 listings + 2 quotes requests, no more
		expect(coinMarketCap).toHaveBeenCalledTimes(4);
	});

	it('skips the extra request when the top list already has every extra coin', async () => {
		const { coinMarketCap } = await run({ coinMarketCap: fakeCoinMarketCap(ADDITIONAL_COIN_IDS) });

		expect(coinMarketCap).toHaveBeenCalledTimes(2);
	});

	it('serves recent prices from Firestore without calling CoinMarketCap', async () => {
		const coins = combineListings([cmcCoin(1, 'USD', 1)], [cmcCoin(1, 'EUR', 1)]);
		const { body, coinMarketCap, res } = await run({
			cached: { [CACHE_KEY]: { coins, timestamp: NOW - 4 * MINUTE } },
		});

		expect(body.data).toEqual(coins);
		expect(coinMarketCap).not.toHaveBeenCalled();
		expect(res.headers['cache-control']).toMatch(/s-maxage=360/); // 6 minutes left
	});

	it('refreshes prices older than 10 minutes', async () => {
		const coins = combineListings([cmcCoin(1, 'USD', 1)], [cmcCoin(1, 'EUR', 1)]);
		const { coinMarketCap, firestore } = await run({
			cached: { [CACHE_KEY]: { coins, timestamp: NOW - 11 * MINUTE } },
		});

		expect(coinMarketCap).toHaveBeenCalled();
		expect(firestore.writes).toEqual([CACHE_KEY]);
	});

	it('serves the last good prices, marked as stale, when CoinMarketCap fails', async () => {
		const coins = combineListings([cmcCoin(1, 'USD', 1)], [cmcCoin(1, 'EUR', 1)]);
		const { body, firestore, res } = await run({
			cached: { [CACHE_KEY]: { coins, timestamp: NOW - 3 * 60 * MINUTE } },
			coinMarketCap: vi.fn<CoinMarketCapGet>(() =>
				Promise.reject(new Error('Request failed with status code 429'))
			),
		});

		expect(res.statusCode).toBe(200);
		expect(body.data).toEqual(coins);
		expect(body.status.stale).toBe(true);
		expect(firestore.writes).toEqual([]);
		expect(res.headers['cache-control']).toMatch(/s-maxage=60\b/);
	});

	it('reports an error the frontend understands when there is nothing to fall back on', async () => {
		const { body, res } = await run({
			coinMarketCap: vi.fn<CoinMarketCapGet>(() => Promise.reject(new Error('down'))),
		});

		expect(res.statusCode).toBe(502);
		expect(body).toMatchObject({ data: null, status: { error_code: 502 } });
		expect(res.headers['cache-control']).toBe('no-store');
	});

	it('replaces a cache document in the old format', async () => {
		const { coinMarketCap, firestore } = await run({
			cached: { [CACHE_KEY]: { apiResponse: { data: [] }, timestamp: NOW - MINUTE } },
		});

		expect(coinMarketCap).toHaveBeenCalled();
		expect(firestore.store.get(CACHE_KEY)).toMatchObject({
			coins: expect.any(Array) as unknown,
			timestamp: NOW,
		});
	});

	it('still serves prices when Firestore is unavailable', async () => {
		const handler = createHandler({
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
