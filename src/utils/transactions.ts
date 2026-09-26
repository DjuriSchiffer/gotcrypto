import uniqueId from 'lodash.uniqueid';

import type { FormInputs } from '../components/TransactionForm';
import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import totals from './totals';

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
