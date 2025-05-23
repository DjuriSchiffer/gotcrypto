import type { GlobalTotals } from 'store';

import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import { averagePurchasePrice, currentValue, percentageDifference } from './helpers';

/**
 * Calculates totals based on the selected currencies and their transactions.
 * @param transactions - The array of transactions.
 * @returns An object containing various totals.
 */
const totals = (transactions: Array<Transaction> = []): SelectedAsset['totals'] => {
	if (transactions.length === 0) {
		return {
			totalAmount: 0,
			totalAmountBought: 0,
			totalAmountSold: 0,
			totalAveragePurchasePrice: 0,
			totalAverageSellPrice: 0,
			totalInvested: 0,
			totalPurchasePrice: 0,
			totalSellPrice: 0,
		};
	}

	const parseNumber = (value: string): number => {
		return Number(parseFloat(value).toFixed(8));
	};

	const sums = transactions.reduce(
		(acc, transaction) => {
			const amount = parseNumber(transaction.amount);
			const purchasePrice = parseNumber(transaction.purchasePrice);

			switch (transaction.type) {
				case 'buy':
					acc.amountBought += amount;
					acc.purchasePrice += purchasePrice;
					break;
				case 'sell':
					acc.amountSold += amount;
					acc.sellPrice += purchasePrice;
					break;
				case 'transfer':
					if (transaction.transferType === 'in') {
						acc.amountTransferedIn += amount;
						acc.valueTransferedIn += purchasePrice;
					} else if (transaction.transferType === 'out') {
						acc.amountTransferedOut += amount;
						acc.valueTransferedOut += purchasePrice;
					}
					break;
			}

			return acc;
		},
		{
			amountBought: 0,
			amountSold: 0,
			amountTransferedIn: 0,
			amountTransferedOut: 0,
			purchasePrice: 0,
			sellPrice: 0,
			valueTransferedIn: 0,
			valueTransferedOut: 0,
		}
	);

	const totalAmount = Number(
		(
			sums.amountBought +
			sums.amountTransferedIn -
			sums.amountSold -
			sums.amountTransferedOut
		).toFixed(8)
	);

	const totalInvested = Number(sums.purchasePrice - sums.sellPrice);

	return {
		totalAmount,
		totalAmountBought: Number(sums.amountBought.toFixed(8)),
		totalAmountSold: Number(sums.amountSold.toFixed(8)),
		totalAveragePurchasePrice: Number(averagePurchasePrice(sums.purchasePrice, sums.amountBought)),
		totalAverageSellPrice: Number(averagePurchasePrice(sums.sellPrice, sums.amountSold)),
		totalInvested,
		totalPurchasePrice: Number(sums.purchasePrice),
		totalSellPrice: Number(sums.sellPrice),
	};
};

export default totals;

/**
 * Calculates global totals including total value and percentage differences.
 * @param selectedCurrencies - The array of selected currencies.
 * @param fetchedCurrencies - The array of all fetched currencies.
 * @returns An object adhering to the GlobalTotals interface.
 */
export const getGlobalTotals = (
	selectedCurrencies: Array<SelectedAsset> = [],
	fetchedCurrencies: Array<FetchedCurrency> | null = []
): GlobalTotals => {
	if (!selectedCurrencies.length || !fetchedCurrencies?.length) {
		return {
			totalAmount: 0,
			totalAveragePurchasePrice: 0,
			totalInvested: 0,
			totalPercentageDifference: 0,
			totalPurchasePrice: 0,
			totalValue: 0,
		};
	}

	const filteredSelectedCurrencies = selectedCurrencies.filter(
		(currency) => currency.transactions.length > 0
	);

	// Early return if no currencies have transactions
	if (!filteredSelectedCurrencies.length) {
		return {
			totalAmount: 0,
			totalAveragePurchasePrice: 0,
			totalInvested: 0,
			totalPercentageDifference: 0,
			totalPurchasePrice: 0,
			totalValue: 0,
		};
	}

	// Create a lookup map for faster currency price lookups
	const currencyPriceMap = new Map(
		fetchedCurrencies.map((currency) => [currency.cmc_id, currency.price || 0])
	);

	const totals = filteredSelectedCurrencies.reduce(
		(acc, selectCurrency) => {
			const currentPrice = currencyPriceMap.get(selectCurrency.cmc_id) ?? 0;
			const currencyAmount = selectCurrency.totals.totalAmount || 0;
			const currencyInvested = selectCurrency.totals.totalInvested || 0;
			const currencyPurchasePrice = selectCurrency.totals.totalPurchasePrice || 0;
			const currencyValue = currencyAmount * currentPrice;

			return {
				amount: acc.amount + currencyAmount,
				invested: acc.invested + currencyInvested,
				purchasePrice: acc.purchasePrice + currencyPurchasePrice,
				value: acc.value + currencyValue,
			};
		},
		{ amount: 0, invested: 0, purchasePrice: 0, value: 0 }
	);

	const totalPercentageDifference =
		typeof percentageDifference(totals.invested, totals.value) === 'number'
			? percentageDifference(totals.invested, totals.value)
			: 0;

	const totalAveragePurchasePrice = averagePurchasePrice(totals.purchasePrice, totals.amount);

	return {
		totalAmount: totals.amount,
		totalAveragePurchasePrice,
		totalInvested: totals.invested,
		totalPercentageDifference,
		totalPurchasePrice: totals.purchasePrice,
		totalValue: totals.value,
	};
};

export const getTotalAmount = (assetMap: Map<number, SelectedAsset>, cmcId: number): number => {
	return assetMap.get(cmcId)?.totals.totalAmount ?? 0;
};

export const getTotalValue = (assetMap: Map<number, SelectedAsset>, cmcId: number): number => {
	const totalAmount = assetMap.get(cmcId)?.totals.totalAmount ?? 0;
	return totalAmount || 0;
};

export const getTotalPurchasePrice = (
	cryptoMap: Map<number, SelectedAsset>,
	cmcId: number
): number => {
	return cryptoMap.get(cmcId)?.totals.totalPurchasePrice ?? 0;
};

export const getTotalInvested = (cryptoMap: Map<number, SelectedAsset>, cmcId: number): number => {
	return cryptoMap.get(cmcId)?.totals.totalInvested ?? 0;
};

export const getTotalPercentageDifference = (
	assetMap: Map<number, SelectedAsset>,
	cmcId: number,
	currentMarketPrice: number
): number => {
	const currency = assetMap.get(cmcId);
	if (!currency?.totals.totalAmount || !currency.totals.totalPurchasePrice) {
		return 0;
	}

	const totalValue = currentValue(currency.totals.totalAmount, currentMarketPrice);
	return percentageDifference(currency.totals.totalPurchasePrice, totalValue);
};
