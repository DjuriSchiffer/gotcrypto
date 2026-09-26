import { describe, expect, it } from 'vitest';

import { asset, buy, sell, transferIn, transferOut } from '../test/factories';
import totals, {
	getAssetSummary,
	getGlobalTotals,
	getTotalPercentageDifference,
	positionHistory,
} from './totals';

const last = <T>(items: Array<T>): T | undefined => items.at(-1);

describe('positionHistory', () => {
	it('returns an empty history for no transactions', () => {
		expect(positionHistory([])).toEqual([]);
	});

	it('tracks a single buy', () => {
		expect(last(positionHistory([buy(1, 10000)]))).toMatchObject({
			amount: 1,
			costBasis: 10000,
			realizedProfit: 0,
		});
	});

	it('removes coins at average cost on a partial sell', () => {
		const history = positionHistory([buy(1, 10000), sell(0.5, 30000)]);

		expect(last(history)).toMatchObject({
			amount: 0.5,
			costBasis: 5000,
			realizedProfit: 25000,
		});
	});

	it('averages the cost over multiple buys', () => {
		const history = positionHistory([
			buy(1, 10000, '2024-01-01'),
			buy(1, 20000, '2024-02-01'),
			sell(1, 30000, '2024-03-01'),
		]);

		// average cost is 15.000 per coin, so selling 1 for 30.000 realizes 15.000
		expect(last(history)).toMatchObject({
			amount: 1,
			costBasis: 15000,
			realizedProfit: 15000,
		});
	});

	it('records a loss as negative realized profit', () => {
		expect(last(positionHistory([buy(1, 10000), sell(1, 4000)]))?.realizedProfit).toBe(-6000);
	});

	it('ends at exactly zero after selling everything', () => {
		const history = positionHistory([buy(0.1, 1), buy(0.2, 2), sell(0.3, 5)]);

		// 0.1 + 0.2 is 0.30000000000000004 in floating point; the dust must not survive
		expect(last(history)).toMatchObject({ amount: 0, costBasis: 0, realizedProfit: 2 });
	});

	it('starts a fresh cost basis when buying again after closing a position', () => {
		const history = positionHistory([
			buy(1, 100, '2024-01-01'),
			sell(1, 150, '2024-02-01'),
			buy(1, 200, '2024-03-01'),
		]);

		expect(last(history)).toMatchObject({ amount: 1, costBasis: 200, realizedProfit: 50 });
	});

	it('processes transactions chronologically regardless of input order', () => {
		const history = positionHistory([sell(0.5, 30000, '2024-06-01'), buy(1, 10000, '2024-01-01')]);

		expect(history.map((step) => step.transaction.type)).toEqual(['buy', 'sell']);
		expect(last(history)).toMatchObject({ amount: 0.5, realizedProfit: 25000 });
	});

	it('puts buys before sells on the same day', () => {
		const history = positionHistory([sell(0.5, 30000, '2024-01-01'), buy(1, 10000, '2024-01-01')]);

		expect(history.map((step) => step.transaction.type)).toEqual(['buy', 'sell']);
	});

	it('does not mutate the input array', () => {
		const transactions = [sell(0.5, 30000, '2024-06-01'), buy(1, 10000, '2024-01-01')];
		const before = [...transactions];

		positionHistory(transactions);

		expect(transactions).toEqual(before);
	});

	it('treats coins sold beyond holdings as zero-cost', () => {
		const history = positionHistory([buy(1, 10000), sell(2, 40000)]);

		expect(last(history)).toMatchObject({ amount: 0, costBasis: 0, realizedProfit: 30000 });
	});

	it('adds a transfer in to the cost basis', () => {
		expect(last(positionHistory([transferIn(1, 8000)]))).toMatchObject({
			amount: 1,
			costBasis: 8000,
		});
	});

	it('removes a transfer out at average cost without realizing profit', () => {
		const history = positionHistory([buy(2, 10000), transferOut(1, 99999)]);

		expect(last(history)).toMatchObject({ amount: 1, costBasis: 5000, realizedProfit: 0 });
	});

	it('ignores a transfer without a direction', () => {
		const incomplete = { ...transferIn(1, 5000), transferType: undefined };

		expect(last(positionHistory([buy(1, 1000), incomplete]))).toMatchObject({
			amount: 1,
			costBasis: 1000,
		});
	});

	it('treats unparseable numbers as zero', () => {
		expect(last(positionHistory([buy('abc', 'xyz'), buy(1, 100)]))).toMatchObject({
			amount: 1,
			costBasis: 100,
		});
	});
});

describe('totals', () => {
	it('returns zeros for no transactions', () => {
		expect(Object.values(totals([])).every((value) => value === 0)).toBe(true);
	});

	it('calculates the full set of totals for a buy and a partial sell', () => {
		expect(totals([buy(1, 10000), sell(0.5, 30000)])).toEqual({
			totalAmount: 0.5,
			totalAmountBought: 1,
			totalAmountSold: 0.5,
			totalAverageCost: 10000,
			totalAveragePurchasePrice: 10000,
			totalAverageSellPrice: 60000,
			totalCostBasis: 5000,
			totalNetCashFlow: -20000,
			totalPurchasePrice: 10000,
			totalRealizedProfit: 25000,
			totalSellPrice: 30000,
		});
	});

	it('keeps sub-cent average prices instead of rounding them to zero', () => {
		const result = totals([buy(1_000_000, 40)]);

		expect(result.totalAveragePurchasePrice).toBe(0.00004);
		expect(result.totalAverageCost).toBe(0.00004);
	});

	it('does not count transfers as bought or sold', () => {
		const result = totals([transferIn(1, 5000), transferOut(0.5, 2500)]);

		expect(result.totalAmountBought).toBe(0);
		expect(result.totalAmountSold).toBe(0);
		expect(result.totalAmount).toBe(0.5);
	});
});

describe('getGlobalTotals', () => {
	const prices = [
		{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
		{ cmc_id: 2, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
	];

	it('returns zeros when there is nothing to total', () => {
		expect(getGlobalTotals([], prices).totalValue).toBe(0);
		expect(getGlobalTotals([asset(1, [buy(1, 100)])], null).totalValue).toBe(0);
		expect(getGlobalTotals([asset(1, [buy(1, 100)])], []).totalValue).toBe(0);
	});

	it('combines value, cost basis and realized profit across assets', () => {
		const result = getGlobalTotals(
			[asset(1, [buy(1, 10000), sell(0.5, 30000)]), asset(2, [buy(2, 4000)])],
			prices
		);

		// BTC: 0.5 × 60.000 = 30.000 value, 5.000 cost. ETH: 2 × 3.000 = 6.000 value, 4.000 cost.
		expect(result).toEqual({
			totalCostBasis: 9000,
			totalPercentageDifference: 300,
			totalRealizedProfit: 25000,
			totalUnrealizedProfit: 27000,
			totalValue: 36000,
		});
	});

	it('skips assets without transactions', () => {
		const result = getGlobalTotals([asset(1, [buy(1, 10000)]), asset(2)], prices);

		expect(result.totalValue).toBe(60000);
	});

	it('values an asset without a known price at zero', () => {
		const result = getGlobalTotals([asset(999, [buy(1, 500)])], prices);

		expect(result.totalValue).toBe(0);
		expect(result.totalPercentageDifference).toBe(-100);
	});
});

describe('getAssetSummary', () => {
	it('returns an empty summary for a missing asset', () => {
		expect(getAssetSummary(undefined, 60000)).toEqual({
			amount: 0,
			averageCost: 0,
			costBasis: 0,
			isClosed: false,
			hasSold: false,
			realizedProfit: 0,
			unrealizedPercentage: 0,
			unrealizedProfit: 0,
			value: 0,
		});
	});

	it('summarizes an open position at the current price', () => {
		const summary = getAssetSummary(asset(1, [buy(1, 10000), sell(0.5, 30000)]), 60000);

		expect(summary).toMatchObject({
			amount: 0.5,
			costBasis: 5000,
			isClosed: false,
			realizedProfit: 25000,
			unrealizedPercentage: 500,
			unrealizedProfit: 25000,
			value: 30000,
		});
	});

	it('marks a fully sold position as closed but keeps its realized profit', () => {
		const summary = getAssetSummary(asset(1, [buy(1, 10000), sell(1, 30000)]), 60000);

		expect(summary).toMatchObject({ amount: 0, isClosed: true, realizedProfit: 20000 });
	});

	it('does not mark an asset without transactions as closed', () => {
		expect(getAssetSummary(asset(1), 60000).isClosed).toBe(false);
	});

	it('reports a break-even sell as sold with zero realized profit', () => {
		const summary = getAssetSummary(asset(1, [buy(1, 10000), sell(0.5, 5000)]), 60000);

		expect(summary).toMatchObject({ hasSold: true, realizedProfit: 0 });
	});

	it('does not count a transfer out as a sale', () => {
		const summary = getAssetSummary(asset(1, [buy(1, 10000), transferOut(0.5, 5000)]), 60000);

		expect(summary.hasSold).toBe(false);
	});
});

describe('getTotalPercentageDifference', () => {
	it('measures the return against cost basis, not against everything ever bought', () => {
		const assetMap = new Map([[1, asset(1, [buy(1, 10000), sell(0.5, 30000)])]]);

		// value 0.5 × 20.000 = 10.000 against a cost basis of 5.000
		expect(getTotalPercentageDifference(assetMap, 1, 20000)).toBe(100);
	});

	it('returns 0 for unknown or fully sold assets', () => {
		const assetMap = new Map([[1, asset(1, [buy(1, 10000), sell(1, 30000)])]]);

		expect(getTotalPercentageDifference(assetMap, 1, 20000)).toBe(0);
		expect(getTotalPercentageDifference(assetMap, 42, 20000)).toBe(0);
	});
});
