import uniqueId from 'lodash.uniqueid';

import type { FormInputs } from '../components/TransactionForm';
import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import { percentageDifference } from './helpers';
import totals, { positionHistory } from './totals';

/** Parses user input like "1.234,56" or "0,5" into a positive number. */
const parseInput = (value: string): number => Math.abs(parseFloat(value.replace(',', '.')));

/**
 * Converts submitted form values into a stored transaction.
 * Pass the existing `id` when editing, so the transaction is replaced instead of added.
 */
export const transactionFromForm = (formData: FormInputs, id?: string): Transaction => ({
	amount: parseInput(formData.amount).toString(),
	date: formData.date,
	description: formData.description ?? '',
	excludeForTax: formData.excludeForTax ?? false,
	id: id ?? uniqueId(`trans_${Date.now()}_`),
	purchasePrice: parseInput(formData.purchasePrice).toFixed(2),
	type: formData.transactionType,
	...(formData.transactionType === 'transfer'
		? { transferType: formData.transferType ?? 'in' }
		: {}),
});

/**
 * Adds a transaction to an asset, or replaces the one with the same id.
 *
 * Works for an asset that isn't stored yet (`asset` undefined), and fills in
 * fields that assets created by the asset picker may be missing, like the slug.
 */
export const upsertTransaction = (
	asset: SelectedAsset | undefined,
	fetchedCurrency: Pick<FetchedCurrency, 'cmc_id' | 'name' | 'slug'>,
	transaction: Transaction,
	index = 0
): SelectedAsset => {
	const existing = asset?.transactions ?? [];
	const isEdit = existing.some((item) => item.id === transaction.id);

	const transactions = (
		isEdit
			? existing.map((item) => (item.id === transaction.id ? transaction : item))
			: [...existing, transaction]
	).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return {
		...asset,
		cmc_id: fetchedCurrency.cmc_id,
		index: asset?.index ?? index,
		name: asset?.name || fetchedCurrency.name,
		slug: asset?.slug || fetchedCurrency.slug,
		totals: totals(transactions),
		transactions,
	};
};

/** Removes one transaction and recalculates the totals. */
export const removeTransaction = (asset: SelectedAsset, transactionId: string): SelectedAsset => {
	const transactions = asset.transactions.filter((item) => item.id !== transactionId);
	return { ...asset, totals: totals(transactions), transactions };
};

/** Removes every transaction; the asset itself stays on the dashboard. */
export const clearTransactions = (asset: SelectedAsset): SelectedAsset => ({
	...asset,
	totals: totals([]),
	transactions: [],
});

export type TransactionRow = {
	/** Signed: negative for sells and transfers out */
	amount: number;
	/** What the coins removed by this sell cost; null for other types */
	costOfSold: null | number;
	pricePerCoin: number;
	/** Profit locked in by this sell; null for other types */
	realizedProfit: null | number;
	transaction: Transaction;
	/** Current value of these coins vs. what they cost; buys only */
	unrealizedPercentage: null | number;
};

export type TransactionYear = {
	rows: Array<TransactionRow>;
	year: number;
};

/**
 * Prepares transactions for the detail table: newest first, grouped by year,
 * with the result of each buy (against today's price) and each sell (realized).
 */
export const getTransactionYears = (
	transactions: Array<Transaction>,
	currentPrice: number
): Array<TransactionYear> => {
	const history = positionHistory(transactions);

	// Realized profit is cumulative in the history; a sell's own result is the step it adds
	const realizedById = new Map<string, number>();
	let previousRealized = 0;
	for (const step of history) {
		if (step.transaction.type === 'sell') {
			realizedById.set(
				step.transaction.id,
				Number((step.realizedProfit - previousRealized).toFixed(2))
			);
		}
		previousRealized = step.realizedProfit;
	}

	const years: Array<TransactionYear> = [];

	for (const { transaction } of [...history].reverse()) {
		const quantity = parseFloat(transaction.amount) || 0;
		const price = parseFloat(transaction.purchasePrice) || 0;
		const isOutflow =
			transaction.type === 'sell' ||
			(transaction.type === 'transfer' && transaction.transferType === 'out');

		const row: TransactionRow = {
			amount: isOutflow ? -quantity : quantity,
			costOfSold: realizedById.has(transaction.id)
				? Number((price - (realizedById.get(transaction.id) ?? 0)).toFixed(2))
				: null,
			pricePerCoin: quantity > 0 ? price / quantity : 0,
			realizedProfit: realizedById.get(transaction.id) ?? null,
			transaction,
			unrealizedPercentage:
				transaction.type === 'buy' ? percentageDifference(price, quantity * currentPrice) : null,
		};

		const year = new Date(transaction.date).getUTCFullYear();
		const group = years.at(-1);
		if (group?.year === year) {
			group.rows.push(row);
		} else {
			years.push({ rows: [row], year });
		}
	}

	return years;
};
