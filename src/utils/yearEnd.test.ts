import { describe, expect, it } from 'vitest';

import type { Transaction } from '../types/currency';

import { asset, buy, sell, transferOut } from '../test/factories';
import {
	combineYearEndValues,
	extractYearEndPrice,
	getYearEndHoldings,
	priceKey,
	yearEndTimestamp,
} from './yearEnd';

const excluded = (transaction: Transaction): Transaction => ({
	...transaction,
	excludeForTax: true,
});

describe('getYearEndHoldings', () => {
	it('returns nothing without transactions', () => {
		expect(getYearEndHoldings([asset(1)], 2026)).toEqual([]);
	});

	it('lists every completed year from the first transaction, but not the current year', () => {
		const result = getYearEndHoldings([asset(1, [buy(1, 100, '2022-05-01')])], 2025);

		expect(result.map((item) => item.year)).toEqual([2022, 2023, 2024]);
	});

	it('tracks holdings through buys, sells and transfers', () => {
		const result = getYearEndHoldings(
			[
				asset(
					1,
					[
						buy(2, 100, '2022-01-01'),
						sell(0.5, 100, '2023-03-01'),
						transferOut(0.5, 0, '2024-07-01'),
					],
					'Bitcoin'
				),
			],
			2025
		);

		expect(result.map((item) => item.holdings[0]?.amount)).toEqual([2, 1.5, 1]);
	});

	it('leaves out transactions marked as excluded for tax', () => {
		const result = getYearEndHoldings(
			[asset(1, [buy(1, 100, '2023-01-01'), excluded(buy(5, 100, '2023-02-01'))], 'Bitcoin')],
			2024
		);

		expect(result[0].holdings).toEqual([{ amount: 1, cmcId: 1, name: 'Bitcoin' }]);
	});

	it('keeps a year without holdings, with an empty list', () => {
		const result = getYearEndHoldings(
			[
				asset(1, [
					buy(1, 100, '2022-01-01'),
					sell(1, 200, '2022-06-01'),
					buy(1, 100, '2024-01-01'),
				]),
			],
			2025
		);

		expect(result.map((item) => item.holdings.length)).toEqual([0, 0, 1]);
	});

	it('assigns a 1 January transaction to its own year', () => {
		const result = getYearEndHoldings([asset(1, [buy(1, 100, '2023-01-01')])], 2024);

		expect(result).toEqual([{ holdings: [{ amount: 1, cmcId: 1, name: 'Coin 1' }], year: 2023 }]);
	});
});

describe('combineYearEndValues', () => {
	const years = [
		{
			holdings: [
				{ amount: 2, cmcId: 1, name: 'Bitcoin' },
				{ amount: 10, cmcId: 2, name: 'Ethereum' },
			],
			year: 2023,
		},
		{ holdings: [], year: 2024 },
	];

	it('adds up the value of every holding', () => {
		const prices = new Map([
			[priceKey(1, 2023), 40000],
			[priceKey(2, 2023), 2000],
		]);

		expect(combineYearEndValues(years, prices)[0]).toEqual({
			missingAssets: [],
			totalValue: 100000,
			year: 2023,
		});
	});

	it('reports a missing price instead of using another price', () => {
		const prices = new Map([[priceKey(1, 2023), 40000]]);

		expect(combineYearEndValues(years, prices)[0]).toEqual({
			missingAssets: ['Ethereum'],
			totalValue: 80000,
			year: 2023,
		});
	});

	it('gives a year without holdings a complete value of zero', () => {
		expect(combineYearEndValues(years, new Map())[1]).toEqual({
			missingAssets: [],
			totalValue: 0,
			year: 2024,
		});
	});
});

describe('extractYearEndPrice', () => {
	it('reads the price from the API response', () => {
		expect(extractYearEndPrice({ data: { convertQuotes: [{ price: 42000.5 }] } })).toBe(42000.5);
		expect(extractYearEndPrice({ data: { quotes: [{ quote: { price: 41000 } }] } })).toBe(41000);
	});

	it('returns null for an error response or anything unexpected', () => {
		expect(
			extractYearEndPrice({ data: null, error: 'Failed to fetch cryptocurrency data' })
		).toBeNull();
		expect(extractYearEndPrice({ data: { convertQuotes: [] } })).toBeNull();
		expect(extractYearEndPrice({ data: { convertQuotes: [{ price: '42000' }] } })).toBeNull();
		expect(extractYearEndPrice({ data: { convertQuotes: [{ price: 0 }] } })).toBeNull();
		expect(extractYearEndPrice(undefined)).toBeNull();
		expect(extractYearEndPrice('<html>500</html>')).toBeNull();
	});
});

describe('yearEndTimestamp', () => {
	it('is midnight on 1 January of the next year, local time', () => {
		const moment = new Date(yearEndTimestamp(2023) * 1000);

		expect([moment.getFullYear(), moment.getMonth(), moment.getDate(), moment.getHours()]).toEqual([
			2024, 0, 1, 0,
		]);
	});
});
