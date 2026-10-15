import { describe, expect, it } from 'vitest';

import type { FetchedCurrency } from '../types/currency';

import { asset, buy, sell } from '../test/factories';
import { coinPath, findDetailCoin, getDashboardAssets } from './assets';
import { getAllocationSlices, getHighlights, getPortfolioBreakdown } from './portfolio';
import { getAssetSummary, getGlobalTotals, getUnpricedHoldings } from './totals';
import { getTransactionYears } from './transactions';

/**
 * A coin you hold must never disappear just because the price list doesn't include it
 * (delisted, dropped out of the list, or prices temporarily unavailable).
 */

const coin = (cmcId: number, price: number, name = `Coin ${String(cmcId)}`): FetchedCurrency => ({
	cmc_id: cmcId,
	cmc_rank: cmcId,
	name,
	price,
	slug: name.toLowerCase().replace(/\s+/g, '-'),
});

const prices = [coin(1, 60000, 'Bitcoin'), coin(2, 3000, 'Ethereum')];

describe('getDashboardAssets with a coin missing from the price list', () => {
	it('still shows a held coin that has no price, marked with price null', () => {
		const selected = [asset(1, [buy(1, 10000)], 'Bitcoin'), asset(999, [buy(10, 500)], 'Gone Coin')];

		const result = getDashboardAssets(prices, selected, 'cmc_rank');

		expect(result.map((item) => item.cmc_id)).toEqual([1, 999]);
		expect(result[1]).toEqual({
			cmc_id: 999,
			cmc_rank: null,
			name: 'Gone Coin',
			price: null,
			slug: 'gone-coin',
		});
	});

	it('also shows an added coin without transactions', () => {
		const result = getDashboardAssets(prices, [asset(999, [], 'Gone Coin')], 'cmc_rank');

		expect(result.map((item) => item.cmc_id)).toEqual([999]);
	});

	it('keeps held coins first when sorting by selected status, priced or not', () => {
		const selected = [
			asset(1, [], 'Bitcoin'),
			asset(999, [buy(10, 500)], 'Gone Coin'),
			asset(2, [buy(1, 2000)], 'Ethereum'),
		];

		const result = getDashboardAssets(prices, selected, 'has_selected');

		expect(result.map((item) => item.cmc_id)).toEqual([2, 999, 1]);
	});

	it('shows a coin once, even if it was saved twice', () => {
		const result = getDashboardAssets(prices, [asset(1), asset(1)], 'cmc_rank');

		expect(result).toHaveLength(1);
	});

	it('names a coin saved without a name after its id', () => {
		const nameless = { ...asset(999, [buy(1, 1)]), name: '' };

		expect(getDashboardAssets(prices, [nameless], 'cmc_rank')[0].name).toBe('Coin #999');
	});
});

describe('coinPath', () => {
	it('uses the slug', () => {
		expect(coinPath({ cmc_id: 1, slug: 'bitcoin' })).toBe('/bitcoin');
	});

	it('falls back to the id for assets saved without a slug', () => {
		expect(coinPath({ cmc_id: 1027, slug: '' })).toBe('/1027');
	});
});

describe('findDetailCoin', () => {
	const gone = asset(999, [buy(10, 500)], 'Gone Coin');

	it('finds a priced coin by slug', () => {
		expect(findDetailCoin('bitcoin', prices, [])).toMatchObject({ cmc_id: 1, price: 60000 });
	});

	it("finds the user's own coin without a price", () => {
		expect(findDetailCoin('gone-coin', prices, [gone])).toMatchObject({
			cmc_id: 999,
			price: null,
		});
	});

	it('finds an asset saved without a slug by its id, with its price', () => {
		const noSlug = { ...asset(2, [buy(1, 2000)], 'Ethereum'), slug: '' };

		expect(findDetailCoin('2', prices, [noSlug])).toMatchObject({ cmc_id: 2, price: 3000 });
	});

	it('finds nothing for an unknown address or no address', () => {
		expect(findDetailCoin('nope', prices, [gone])).toBeUndefined();
		expect(findDetailCoin(undefined, prices, [gone])).toBeUndefined();
	});

	it('works before prices have loaded', () => {
		expect(findDetailCoin('gone-coin', undefined, [gone])).toMatchObject({ price: null });
	});
});

describe('totals with a held coin that has no price', () => {
	const bitcoin = asset(1, [buy(1, 10000)], 'Bitcoin');
	const gone = asset(999, [buy(10, 500), sell(5, 400)], 'Gone Coin');

	it('lists only held coins without a price', () => {
		const closed = asset(998, [buy(1, 100), sell(1, 50)], 'Closed Coin');
		const unpriced = getUnpricedHoldings([bitcoin, gone, closed], prices);

		expect(unpriced.map((item) => item.cmc_id)).toEqual([999]);
	});

	it('treats every holding as unpriced when there are no prices', () => {
		expect(getUnpricedHoldings([bitcoin], undefined)).toHaveLength(1);
	});

	it('leaves it out of value and cost basis instead of counting it as a loss', () => {
		const result = getGlobalTotals([bitcoin, gone], prices);

		expect(result.totalValue).toBe(60000);
		expect(result.totalCostBasis).toBe(10000);
		expect(result.totalUnrealizedProfit).toBe(50000);
		expect(result.totalPercentageDifference).toBe(500);
	});

	it('still counts its realized profit', () => {
		// Sold 5 of 10 coins that cost 500 in total: cost of sold 250, proceeds 400
		expect(getGlobalTotals([bitcoin, gone], prices).totalRealizedProfit).toBe(150);
	});

	it('marks the summary as having no price', () => {
		const summary = getAssetSummary(gone, null);

		expect(summary).toMatchObject({
			amount: 5,
			costBasis: 250,
			hasPrice: false,
			realizedProfit: 150,
			unrealizedPercentage: 0,
			unrealizedProfit: 0,
			value: 0,
		});
	});

	it('marks a summary with a price, even a price of zero, as having one', () => {
		expect(getAssetSummary(gone, 0).hasPrice).toBe(true);
	});

	it('shows no result for buys in the transaction list', () => {
		const rows = getTransactionYears(gone.transactions, null).flatMap((year) => year.rows);

		expect(rows.find((row) => row.transaction.type === 'buy')?.unrealizedPercentage).toBeNull();
		expect(rows.find((row) => row.transaction.type === 'sell')?.realizedProfit).toBe(150);
	});
});

describe('Insights with a held coin that has no price', () => {
	const bitcoin = asset(1, [buy(1, 10000)], 'Bitcoin');
	const gone = asset(999, [buy(10, 500)], 'Gone Coin');
	const goneAndSold = asset(998, [buy(10, 500), sell(10, 800)], 'Sold Coin');
	const rows = getPortfolioBreakdown([bitcoin, gone, goneAndSold], prices);
	const row = (cmcId: number) => rows.find((item) => item.cmcId === cmcId);

	it('marks it, with no price and no share of the portfolio', () => {
		expect(row(999)).toMatchObject({ allocation: 0, price: null, priceMissing: true, value: 0 });
		expect(row(1)).toMatchObject({ allocation: 100, price: 60000, priceMissing: false });
	});

	it("doesn't mark a closed position: its profit is all realized and known", () => {
		expect(row(998)).toMatchObject({ priceMissing: false, totalProfit: 300 });
	});

	it('leaves it out of the allocation chart', () => {
		expect(getAllocationSlices(rows).map((slice) => slice.label)).toEqual(['Bitcoin']);
	});

	it("doesn't rank it as best or worst: its profit is unknown", () => {
		const highlights = getHighlights(rows);

		expect(highlights.best?.name).toBe('Bitcoin');
		expect(highlights.worst?.name).toBe('Sold Coin');
	});

	it('has no best or worst when no coin has a known profit', () => {
		expect(getHighlights(getPortfolioBreakdown([gone], prices))).toEqual({
			best: undefined,
			largest: undefined,
			worst: undefined,
		});
	});
});
