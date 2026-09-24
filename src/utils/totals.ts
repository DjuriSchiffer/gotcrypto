import type { GlobalTotals } from 'store';

import type { FetchedCurrency, SelectedAsset, Totals, Transaction } from '../types/currency';

import { percentageDifference } from './helpers';

/** Holdings smaller than this are treated as zero, to absorb float residue after a full sell. */
const DUST = 1e-10;

const round = (value: number, decimals: number): number =>
	// `|| 0` turns -0 into 0
	Number(value.toFixed(decimals)) || 0;

const toNumber = (value: string): number => {
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

const isInflow = (transaction: Transaction): boolean =>
	transaction.type === 'buy' ||
	(transaction.type === 'transfer' && transaction.transferType === 'in');

const isOutflow = (transaction: Transaction): boolean =>
	transaction.type === 'sell' ||
	(transaction.type === 'transfer' && transaction.transferType === 'out');

/** Oldest first. On the same date, inflows go before outflows. */
const sortChronologically = (transactions: Array<Transaction>): Array<Transaction> =>
	[...transactions].sort((a, b) => {
		const byDate = new Date(a.date).getTime() - new Date(b.date).getTime();
		if (byDate !== 0) return byDate;
		return Number(isInflow(b)) - Number(isInflow(a));
	});

export type PositionSnapshot = {
	/** Coins held after this transaction */
	amount: number;
	/** What the coins held after this transaction cost */
	costBasis: number;
	/** Cumulative realized profit after this transaction */
	realizedProfit: number;
	transaction: Transaction;
};

/**
 * Walks transactions chronologically and tracks the position with the average cost method.
 *
 * - buy / transfer in: adds coins and adds their value to the cost basis
 * - sell: removes coins at average cost; proceeds minus that cost is realized profit
 * - transfer out: removes coins at average cost, no profit or loss
 *
 * Selling more than you hold removes what you have; the excess is treated as zero-cost.
 */
export const positionHistory = (transactions: Array<Transaction> = []): Array<PositionSnapshot> => {
	let amount = 0;
	let costBasis = 0;
	let realizedProfit = 0;

	return sortChronologically(transactions).map((transaction) => {
		const quantity = toNumber(transaction.amount);
		const value = toNumber(transaction.purchasePrice);

		if (isInflow(transaction)) {
			amount += quantity;
			costBasis += value;
		} else if (isOutflow(transaction)) {
			const removed = Math.min(quantity, amount);
			const costOfRemoved = amount > 0 ? costBasis * (removed / amount) : 0;

			amount -= removed;
			costBasis -= costOfRemoved;

			if (transaction.type === 'sell') {
				realizedProfit += value - costOfRemoved;
			}

			if (amount < DUST) {
				amount = 0;
				costBasis = 0;
			}
		}

		return {
			amount: round(amount, 8),
			costBasis: round(costBasis, 2),
			realizedProfit: round(realizedProfit, 2),
			transaction,
		};
	});
};

/**
 * Calculates the totals for a single asset.
 * @param transactions - The asset's transactions, in any order.
 */
const totals = (transactions: Array<Transaction> = []): Totals => {
	const position = positionHistory(transactions).at(-1);
	const amount = position?.amount ?? 0;
	const costBasis = position?.costBasis ?? 0;

	let amountBought = 0;
	let purchasePrice = 0;
	let amountSold = 0;
	let sellPrice = 0;

	for (const transaction of transactions) {
		if (transaction.type === 'buy') {
			amountBought += toNumber(transaction.amount);
			purchasePrice += toNumber(transaction.purchasePrice);
		} else if (transaction.type === 'sell') {
			amountSold += toNumber(transaction.amount);
			sellPrice += toNumber(transaction.purchasePrice);
		}
	}

	return {
		totalAmount: amount,
		totalAmountBought: round(amountBought, 8),
		totalAmountSold: round(amountSold, 8),
		totalAverageCost: amount > 0 ? round(costBasis / amount, 8) : 0,
		totalAveragePurchasePrice: amountBought > 0 ? round(purchasePrice / amountBought, 8) : 0,
		totalAverageSellPrice: amountSold > 0 ? round(sellPrice / amountSold, 8) : 0,
		totalCostBasis: costBasis,
		totalNetCashFlow: round(purchasePrice - sellPrice, 2),
		totalPurchasePrice: round(purchasePrice, 2),
		totalRealizedProfit: position?.realizedProfit ?? 0,
		totalSellPrice: round(sellPrice, 2),
	};
};

export default totals;

const EMPTY_GLOBAL_TOTALS: GlobalTotals = {
	totalCostBasis: 0,
	totalPercentageDifference: 0,
	totalRealizedProfit: 0,
	totalUnrealizedProfit: 0,
	totalValue: 0,
};

/**
 * Calculates portfolio-wide totals.
 * totalPercentageDifference is the unrealized return: (value - cost basis) / cost basis.
 */
export const getGlobalTotals = (
	selectedCurrencies: Array<SelectedAsset> = [],
	fetchedCurrencies: Array<FetchedCurrency> | null = []
): GlobalTotals => {
	if (!selectedCurrencies.length || !fetchedCurrencies?.length) {
		return EMPTY_GLOBAL_TOTALS;
	}

	const priceMap = new Map(
		fetchedCurrencies.map((currency) => [currency.cmc_id, currency.price || 0])
	);

	const sums = selectedCurrencies.reduce(
		(acc, asset) => {
			if (asset.transactions.length === 0) return acc;

			const price = priceMap.get(asset.cmc_id) ?? 0;
			acc.costBasis += asset.totals.totalCostBasis;
			acc.realizedProfit += asset.totals.totalRealizedProfit;
			acc.value += asset.totals.totalAmount * price;
			return acc;
		},
		{ costBasis: 0, realizedProfit: 0, value: 0 }
	);

	return {
		totalCostBasis: round(sums.costBasis, 2),
		totalPercentageDifference: percentageDifference(sums.costBasis, sums.value),
		totalRealizedProfit: round(sums.realizedProfit, 2),
		totalUnrealizedProfit: round(sums.value - sums.costBasis, 2),
		totalValue: sums.value,
	};
};

export const getTotalAmount = (assetMap: Map<number, SelectedAsset>, cmcId: number): number =>
	assetMap.get(cmcId)?.totals.totalAmount ?? 0;

export const getTotalCostBasis = (assetMap: Map<number, SelectedAsset>, cmcId: number): number =>
	assetMap.get(cmcId)?.totals.totalCostBasis ?? 0;

export const getTotalRealizedProfit = (
	assetMap: Map<number, SelectedAsset>,
	cmcId: number
): number => assetMap.get(cmcId)?.totals.totalRealizedProfit ?? 0;

/** Unrealized return of one asset, based on cost basis (not on everything ever bought). */
export const getTotalPercentageDifference = (
	assetMap: Map<number, SelectedAsset>,
	cmcId: number,
	currentMarketPrice: number
): number => {
	const asset = assetMap.get(cmcId);
	if (!asset?.totals.totalCostBasis) return 0;

	return percentageDifference(
		asset.totals.totalCostBasis,
		asset.totals.totalAmount * currentMarketPrice
	);
};

export type AssetSummary = {
	amount: number;
	averageCost: number;
	costBasis: number;
	isClosed: boolean;
	realizedProfit: number;
	unrealizedPercentage: number;
	unrealizedProfit: number;
	value: number;
};

/** Everything the dashboard needs for one asset at the current market price. */
export const getAssetSummary = (
	asset: SelectedAsset | undefined,
	currentPrice: number
): AssetSummary => {
	const amount = asset?.totals.totalAmount ?? 0;
	const costBasis = asset?.totals.totalCostBasis ?? 0;
	const value = amount * currentPrice;

	return {
		amount,
		averageCost: asset?.totals.totalAverageCost ?? 0,
		costBasis,
		isClosed: amount === 0 && (asset?.transactions.length ?? 0) > 0,
		realizedProfit: asset?.totals.totalRealizedProfit ?? 0,
		unrealizedPercentage: percentageDifference(costBasis, value),
		unrealizedProfit: round(value - costBasis, 2),
		value,
	};
};
