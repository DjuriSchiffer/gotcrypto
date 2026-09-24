import type { SelectedAsset, Transaction, TransferType } from '../types/currency';

import totals from '../utils/totals';

let nextId = 0;

const transaction = (
	type: Transaction['type'],
	amount: number | string,
	price: number | string,
	date: string,
	transferType?: TransferType
): Transaction => ({
	amount: String(amount),
	date: `${date}T00:00:00.000Z`,
	id: `test_${nextId++}`,
	purchasePrice: String(price),
	type,
	...(transferType ? { transferType } : {}),
});

/** buy(1, 10000) = bought 1 coin for €10.000 in total */
export const buy = (amount: number | string, price: number | string, date = '2024-01-01') =>
	transaction('buy', amount, price, date);

/** sell(0.5, 30000) = sold 0.5 coin for €30.000 in total */
export const sell = (amount: number | string, price: number | string, date = '2024-06-01') =>
	transaction('sell', amount, price, date);

export const transferIn = (amount: number, value: number, date = '2024-01-01') =>
	transaction('transfer', amount, value, date, 'in');

export const transferOut = (amount: number, value: number, date = '2024-06-01') =>
	transaction('transfer', amount, value, date, 'out');

export const asset = (
	cmcId: number,
	transactions: Array<Transaction> = [],
	name = `Coin ${cmcId}`
): SelectedAsset => ({
	cmc_id: cmcId,
	index: 0,
	name,
	slug: name.toLowerCase().replace(/\s+/g, '-'),
	totals: totals(transactions),
	transactions,
});
