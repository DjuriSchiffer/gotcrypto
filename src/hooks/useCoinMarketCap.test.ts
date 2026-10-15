import type { CurrencyData, GetCurrenciesResponse } from 'api';

import { describe, expect, it } from 'vitest';

import { toPriceList } from './useCoinMarketCap';

const coin = (id: number, rank: null | number, usd: number, eur: number): CurrencyData => ({
	cmc_rank: rank,
	id,
	name: `Coin ${String(id)}`,
	quote: { EUR: { price: eur }, USD: { price: usd } },
	slug: `coin-${String(id)}`,
});

const response = (overrides: Partial<GetCurrenciesResponse['status']> = {}): GetCurrenciesResponse => ({
	data: [coin(2, null, 1, 0.9), coin(1, 1, 60000, 55000)],
	status: { error_code: 0, error_message: null, ...overrides },
});

describe('toPriceList', () => {
	it('turns coins into FetchedCurrency objects in the chosen currency, by rank', () => {
		const { coins } = toPriceList(response(), 'EUR');

		expect(coins).toEqual([
			{ cmc_id: 1, cmc_rank: 1, name: 'Coin 1', price: 55000, slug: 'coin-1' },
			{ cmc_id: 2, cmc_rank: null, name: 'Coin 2', price: 0.9, slug: 'coin-2' },
		]);
	});

	it('passes on that prices are stale, and from when', () => {
		const result = toPriceList(response({ stale: true, timestamp: '2026-10-15T12:00:00.000Z' }), 'USD');

		expect(result.stale).toBe(true);
		expect(result.updatedAt?.toISOString()).toBe('2026-10-15T12:00:00.000Z');
	});

	it('treats a response without the flag as fresh, and ignores a broken timestamp', () => {
		const result = toPriceList(response({ timestamp: 'not a date' }), 'USD');

		expect(result.stale).toBe(false);
		expect(result.updatedAt).toBeNull();
	});

	it("throws the server's message on an error response", () => {
		const error: GetCurrenciesResponse = {
			status: { error_code: 503, error_message: 'Prices are temporarily unavailable' },
		};

		expect(() => toPriceList(error, 'EUR')).toThrow('Prices are temporarily unavailable');
	});

	it('throws a clear message when there is no data and no message', () => {
		expect(() => toPriceList({ status: { error_code: 0, error_message: null } }, 'EUR')).toThrow(
			'Could not load prices from CoinMarketCap'
		);
	});
});
