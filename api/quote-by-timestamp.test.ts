import { describe, expect, it, vi } from 'vitest';

import { fakeFirestore, fakeResponse, requireApi } from './_lib/helpers';

type Handler = (req: unknown, res: ReturnType<typeof fakeResponse>) => Promise<void>;
type CreateHandler = (deps: Record<string, unknown>) => Handler;

const { createHandler } = requireApi('./quote-by-timestamp.js') as { createHandler: CreateHandler };
const { cacheKey, parseQuoteRequest } = requireApi('./_lib/historical.js') as {
	cacheKey: (request: Record<string, number>) => string;
	parseQuoteRequest: (query: Record<string, string>, now: number) => Record<string, unknown>;
};

const NOW = Date.UTC(2026, 9, 13, 12, 0, 0); // 13 Oct 2026, 12:00 UTC
const NOW_SECONDS = NOW / 1000;
const YEAR_END_2024 = Date.UTC(2024, 11, 31, 23, 0, 0) / 1000; // midnight 1 Jan 2025 in Amsterdam

const quote = (price: number) => ({
	data: { convertQuotes: [{ price }], id: 1 },
	status: { error_code: '0' },
});

const request = (query: Record<string, string>, extra: Record<string, unknown> = {}) => ({
	headers: { origin: 'https://gotcrypto.vercel.app' },
	method: 'GET',
	query,
	...extra,
});

type SetupOptions = {
	cached?: Record<string, unknown>;
	fetchQuote?: (request: unknown) => Promise<unknown>;
};

const setup = ({
	cached = {},
	fetchQuote = vi.fn(() => Promise.resolve<unknown>(quote(42000))),
}: SetupOptions = {}) => {
	const firestore = fakeFirestore(cached);
	const handler = createHandler({ fetchQuote, getFirestore: () => firestore.db, now: () => NOW });
	return { fetchQuote, firestore, handler };
};

describe('parseQuoteRequest', () => {
	it('accepts a valid request and rounds the time down to the hour', () => {
		expect(
			parseQuoteRequest(
				{ coinId: '1', convertId: '2790', timestamp: String(YEAR_END_2024 + 1234) },
				NOW_SECONDS
			)
		).toEqual({
			coinId: 1,
			convertId: 2790,
			isFinal: true,
			ok: true,
			timestamp: YEAR_END_2024,
		});
	});

	it('keeps the year-end moment exactly as it is', () => {
		expect(parseQuoteRequest({ timestamp: String(YEAR_END_2024) }, NOW_SECONDS)).toMatchObject({
			timestamp: YEAR_END_2024,
		});
	});

	it('marks the last day as not final yet', () => {
		expect(parseQuoteRequest({ timestamp: String(NOW_SECONDS - 3600) }, NOW_SECONDS)).toMatchObject(
			{ isFinal: false }
		);
	});

	it.each([
		[{ coinId: 'abc' }, /coinId/],
		[{ coinId: '0' }, /coinId/],
		[{ coinId: '1.5' }, /coinId/],
		[{ coinId: '99999999' }, /coinId/],
		[{ convertId: '9999' }, /convertId/],
		[{ timestamp: '-1' }, /timestamp/],
		[{ timestamp: '1000' }, /timestamp/], // 1970
		[{ timestamp: String(NOW_SECONDS + 86400) }, /timestamp/], // tomorrow
		[{ timestamp: '1e9' }, /timestamp/],
	])('rejects %o', (query, message) => {
		const result = parseQuoteRequest(query, NOW_SECONDS);

		expect(result.ok).toBe(false);
		expect(result.message).toMatch(message);
	});
});

describe('GET /api/quote-by-timestamp', () => {
	const yearEnd = { coinId: '1', convertId: '2790', timestamp: String(YEAR_END_2024) };
	const key = `historicalQuotes/${cacheKey({ coinId: 1, convertId: 2790, timestamp: YEAR_END_2024 })}`;

	it('fetches a past quote once, stores it in its own document and lets the CDN keep it', async () => {
		const { fetchQuote, firestore, handler } = setup();
		const res = fakeResponse();

		await handler(request(yearEnd), res);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(quote(42000));
		expect(fetchQuote).toHaveBeenCalledWith({
			coinId: 1,
			convertId: 2790,
			isFinal: true,
			ok: true,
			timestamp: YEAR_END_2024,
		});
		expect(firestore.writes).toEqual([key]);
		expect(res.headers['cache-control']).toMatch(/s-maxage=31536000, immutable/);
	});

	it('answers from the cache without calling CoinMarketCap', async () => {
		const { fetchQuote, handler } = setup({ cached: { [key]: { response: quote(39000) } } });
		const res = fakeResponse();

		await handler(request(yearEnd), res);

		expect(res.body).toEqual(quote(39000));
		expect(fetchQuote).not.toHaveBeenCalled();
	});

	it('does not store a quote that can still change', async () => {
		const { firestore, handler } = setup();
		const res = fakeResponse();

		await handler(request({ coinId: '1', timestamp: String(NOW_SECONDS - 600) }), res);

		expect(res.statusCode).toBe(200);
		expect(firestore.writes).toEqual([]);
		expect(res.headers['cache-control']).toMatch(/s-maxage=300/);
	});

	it('rejects invalid input without calling CoinMarketCap', async () => {
		const { fetchQuote, firestore, handler } = setup();
		const res = fakeResponse();

		await handler(request({ coinId: 'drop table' }), res);

		expect(res.statusCode).toBe(400);
		expect(res.body).toMatchObject({ data: null, status: { error_code: 400 } });
		expect(fetchQuote).not.toHaveBeenCalled();
		expect(firestore.writes).toEqual([]);
		expect(res.headers['cache-control']).toBe('no-store');
	});

	it('reports an unreachable CoinMarketCap and caches nothing', async () => {
		const { firestore, handler } = setup({
			fetchQuote: vi.fn(() => Promise.reject(new Error('timeout'))),
		});
		const res = fakeResponse();

		await handler(request(yearEnd), res);

		expect(res.statusCode).toBe(502);
		expect(firestore.writes).toEqual([]);
	});

	it('never caches a response without a price', async () => {
		const empty = { data: { convertQuotes: [] }, status: { error_code: '0' } };
		const { firestore, handler } = setup({ fetchQuote: vi.fn(() => Promise.resolve(empty)) });
		const res = fakeResponse();

		await handler(request(yearEnd), res);

		expect(res.statusCode).toBe(404);
		expect(firestore.writes).toEqual([]);
	});

	it('still answers when Firestore is unavailable', async () => {
		const handler = createHandler({
			fetchQuote: () => Promise.resolve(quote(42000)),
			getFirestore: () => {
				throw new Error('Missing Firebase environment variables');
			},
			now: () => NOW,
		});
		const res = fakeResponse();

		await handler(request(yearEnd), res);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(quote(42000));
	});

	it('answers a CORS preflight and refuses other methods', async () => {
		const { handler } = setup();
		const preflight = fakeResponse();
		const post = fakeResponse();

		await handler(request(yearEnd, { method: 'OPTIONS' }), preflight);
		await handler(request(yearEnd, { method: 'POST' }), post);

		expect(preflight.statusCode).toBe(204);
		expect(preflight.headers['access-control-allow-origin']).toBe('https://gotcrypto.vercel.app');
		expect(post.statusCode).toBe(405);
	});

	it('only allows the app, its previews and localhost to read responses in a browser', async () => {
		const { handler } = setup();
		const origins = {
			'http://localhost:5173': true,
			'https://evil.example': false,
			'https://gotcrypto-abc123-djurischiffers-projects.vercel.app': true,
			'https://gotcrypto.vercel.app.evil.example': false,
		};

		for (const [origin, allowed] of Object.entries(origins)) {
			const res = fakeResponse();
			await handler(request(yearEnd, { headers: { origin } }), res);
			expect(res.headers['access-control-allow-origin'], origin).toBe(allowed ? origin : undefined);
			expect(res.headers.vary).toBe('Origin');
		}
	});
});
