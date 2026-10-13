import type { CurrencyQuote } from 'api';

import type { SelectedAsset, Transaction } from '../types/currency';

/** Column order of the export. The import will read the same columns. */
export const CSV_COLUMNS = [
	'date',
	'asset',
	'cmc_id',
	'type',
	'amount',
	'total',
	'price_per_coin',
	'currency',
	'exclude_for_tax',
	'description',
	'id',
] as const;

type Column = (typeof CSV_COLUMNS)[number];
type Row = Record<Column, string>;

export type CsvExportOptions = {
	/** Include the exclude_for_tax column; only for users who can set that flag */
	includeTaxColumn?: boolean;
};

/** buy, sell, transfer_in or transfer_out: one word per direction, so the column needs no extra field. */
const typeLabel = (transaction: Transaction): string =>
	transaction.type === 'transfer'
		? `transfer_${transaction.transferType ?? 'in'}`
		: transaction.type;

/** Plain decimal with a dot and no thousands separator, so every spreadsheet and parser reads it. */
const number = (value: number, decimals: number): string =>
	Number.isFinite(value) ? String(Number(value.toFixed(decimals))) : '';

/**
 * Spreadsheet apps run cell values starting with = + - @ as formulas, so a description like
 * "=HYPERLINK(...)" would become a live link. Prefixing a quote keeps it plain text.
 */
const safeText = (value: string): string => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);

/** Quotes a field when it contains a comma, quote or line break (RFC 4180). */
const field = (value: string): string =>
	/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const toRow = (asset: SelectedAsset, transaction: Transaction, currency: string): Row => {
	const amount = parseFloat(transaction.amount) || 0;
	const total = parseFloat(transaction.purchasePrice) || 0;

	return {
		amount: number(amount, 10),
		asset: safeText(asset.name),
		cmc_id: String(asset.cmc_id),
		currency,
		date: transaction.date.slice(0, 10),
		description: safeText(transaction.description ?? ''),
		exclude_for_tax: transaction.excludeForTax ? 'true' : 'false',
		id: transaction.id,
		price_per_coin: amount > 0 ? number(total / amount, 8) : '',
		total: number(total, 2),
		type: typeLabel(transaction),
	};
};

/**
 * All transactions as CSV: one row per transaction, oldest first.
 * `currency` is the currency the prices are in; transactions don't store it themselves.
 * The exclude_for_tax column is left out unless `includeTaxColumn` is set.
 */
export const transactionsToCsv = (
	assets: Array<SelectedAsset>,
	currency: keyof CurrencyQuote,
	{ includeTaxColumn = false }: CsvExportOptions = {}
): string => {
	const columns = CSV_COLUMNS.filter(
		(column: Column) => includeTaxColumn || column !== 'exclude_for_tax'
	);

	const rows = assets
		.flatMap((asset) =>
			asset.transactions.map((transaction) => toRow(asset, transaction, currency))
		)
		.sort((a, b) => a.date.localeCompare(b.date) || a.asset.localeCompare(b.asset));

	const lines = [
		columns.join(','),
		...rows.map((row) => columns.map((column) => field(row[column])).join(',')),
	];

	// CRLF line endings as RFC 4180 prescribes; the BOM makes Excel read the file as UTF-8
	return `\uFEFF${lines.join('\r\n')}\r\n`;
};

/** gotcrypto-transactions-2026-10-13.csv */
export const exportFileName = (today: Date): string =>
	`gotcrypto-transactions-${today.toISOString().slice(0, 10)}.csv`;
