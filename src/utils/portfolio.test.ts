import { describe, expect, it } from 'vitest';

import type { FetchedCurrency } from '../types/currency';

import { asset, buy, sell } from '../test/factories';
import {
	getAllocationSlices,
	getHighlights,
	getPortfolioBreakdown,
	OTHER_LABEL,
	withYearOverYear,
} from './portfolio';

const fetched = (cmcId: number, price: number, name = `Coin ${cmcId}`): FetchedCurrency => ({
	cmc_id: cmcId,
	cmc_rank: cmcId,
	name,
	price,
	slug: name.toLowerCase().replace(/\s+/g, '-'),
});

describe('getPortfolioBreakdown', () => {
	it('returns a row per asset with transactions, largest value first', () => {
		const rows = getPortfolioBreakdown(
			[asset(1, [buy(1, 100)]), asset(2, [buy(1, 100)]), asset(3)],
			[fetched(1, 200), fetched(2, 600), fetched(3, 999)]
		);

		expect(rows.map((row) => row.cmcId)).toEqual([2, 1]);
	});

	it('calculates allocation as a share of the total value', () => {
		const rows = getPortfolioBreakdown(
			[asset(1, [buy(1, 100)]), asset(2, [buy(1, 100)])],
			[fetched(1, 250), fetched(2, 750)]
		);

		expect(rows.map((row) => row.allocation)).toEqual([75, 25]);
	});

	it('combines realized and unrealized profit into total profit', () => {
		// cost basis after sell: 5.000, value: 0.5 × 20.000 = 10.000 → unrealized 5.000
		// realized: 15.000 − 5.000 = 10.000
		const [row] = getPortfolioBreakdown(
			[asset(1, [buy(1, 10000), sell(0.5, 15000)])],
			[fetched(1, 20000)]
		);

		expect(row).toMatchObject({
			realizedProfit: 10000,
			totalProfit: 15000,
			totalProfitPercentage: 150,
			unrealizedProfit: 5000,
		});
	});

	it('keeps closed positions, with zero value and allocation', () => {
		const rows = getPortfolioBreakdown(
			[asset(1, [buy(1, 100), sell(1, 300)]), asset(2, [buy(1, 100)])],
			[fetched(1, 500), fetched(2, 500)]
		);

		expect(rows.find((row) => row.cmcId === 1)).toMatchObject({
			allocation: 0,
			isClosed: true,
			totalProfit: 200,
			value: 0,
		});
	});

	it('falls back to CoinMarketCap data for a missing slug', () => {
		const withoutSlug = { ...asset(1, [buy(1, 100)]), slug: '' };
		const [row] = getPortfolioBreakdown([withoutSlug], [fetched(1, 100, 'Bitcoin')]);

		expect(row.slug).toBe('bitcoin');
	});

	it('handles missing prices without dividing by zero', () => {
		const [row] = getPortfolioBreakdown([asset(1, [buy(1, 100)])], undefined);

		expect(row).toMatchObject({ allocation: 0, price: 0, value: 0 });
	});
});

describe('getHighlights', () => {
	const rows = getPortfolioBreakdown(
		[
			asset(1, [buy(1, 100)], 'Winner'),
			asset(2, [buy(1, 100)], 'Loser'),
			asset(3, [buy(1, 100), sell(1, 5000)], 'Sold'),
		],
		[fetched(1, 300), fetched(2, 50), fetched(3, 999)]
	);

	it('ranks by total profit in money, so realized gains count too', () => {
		// Sold: realized 4.900 beats Winner's unrealized 200
		expect(getHighlights(rows).best?.name).toBe('Sold');
		expect(getHighlights(rows).worst?.name).toBe('Loser');
	});

	it('picks the largest open position', () => {
		expect(getHighlights(rows).largest?.name).toBe('Winner');
	});

	it('has no worst performer with a single asset', () => {
		const single = getPortfolioBreakdown([asset(1, [buy(1, 100)])], [fetched(1, 200)]);

		expect(getHighlights(single).worst).toBeUndefined();
	});

	it('returns nothing for an empty portfolio', () => {
		expect(getHighlights([])).toEqual({});
	});
});

describe('getAllocationSlices', () => {
	const manyAssets = Array.from({ length: 8 }, (_, i) => asset(i + 1, [buy(1, 1)]));
	const prices = Array.from({ length: 8 }, (_, i) => fetched(i + 1, 80 - i * 10));
	const rows = getPortfolioBreakdown(manyAssets, prices);

	it('combines the smallest positions into "Other"', () => {
		const slices = getAllocationSlices(rows, 6);

		expect(slices).toHaveLength(6);
		expect(slices.at(-1)).toEqual({ label: OTHER_LABEL, value: 30 + 20 + 10 });
	});

	it('keeps every slice when there are few enough', () => {
		expect(getAllocationSlices(rows, 10)).toHaveLength(8);
	});

	it('leaves out closed positions', () => {
		const withClosed = getPortfolioBreakdown(
			[asset(1, [buy(1, 1), sell(1, 2)]), asset(2, [buy(1, 1)])],
			[fetched(1, 10), fetched(2, 10)]
		);

		expect(getAllocationSlices(withClosed).map((slice) => slice.label)).toEqual(['Coin 2']);
	});
});

describe('withYearOverYear', () => {
	it('adds the change compared to the previous year, oldest first', () => {
		expect(
			withYearOverYear([
				{ totalValue: 15000, year: 2023 },
				{ totalValue: 10000, year: 2022 },
				{ totalValue: 12000, year: 2024 },
			])
		).toEqual([
			{ change: null, totalValue: 10000, year: 2022 },
			{ change: 50, totalValue: 15000, year: 2023 },
			{ change: -20, totalValue: 12000, year: 2024 },
		]);
	});

	it('has no change after a year with zero value', () => {
		const [, second] = withYearOverYear([
			{ totalValue: 0, year: 2022 },
			{ totalValue: 500, year: 2023 },
		]);

		expect(second.change).toBeNull();
	});
});
