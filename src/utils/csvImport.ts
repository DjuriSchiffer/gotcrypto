import type { CurrencyQuote } from 'api';

import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import totals from './totals';

/** Larger files are almost certainly not a transaction export. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

/** Longer descriptions are cut off; they'd only bloat the saved portfolio. */
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * A signed-in user's portfolio is one Firestore document, which can hold at most 1 MiB.
 * This leaves room for preferences and Firestore's own overhead.
 */
export const MAX_PORTFOLIO_BYTES = 900 * 1024;

/** No crypto transaction can predate Bitcoin. */
const EARLIEST_YEAR = 2009;

/** Ids from the file are kept only when they look like ids the app itself creates. */
const VALID_ID = /^[\w-]{1,100}$/;

const REQUIRED_COLUMNS = ['date', 'type', 'amount', 'total'] as const;

// ---------------------------------------------------------------------------
// Reading the file
// ---------------------------------------------------------------------------

/**
 * Comma or semicolon: Excel with a Dutch locale saves CSV files with semicolons.
 * Decided by the header line, ignoring anything inside quotes.
 */
export const detectDelimiter = (text: string): ',' | ';' => {
	const header = text.split(/\r?\n/, 1)[0].replace(/"[^"]*"/g, '');
	const count = (char: string) => header.split(char).length - 1;
	return count(';') > count(',') ? ';' : ',';
};

/** Splits CSV text into rows of fields (RFC 4180: quoted fields may contain delimiters, quotes and line breaks). */
export const parseCsv = (
	input: string,
	delimiter: ',' | ';' = detectDelimiter(input)
): Array<Array<string>> => {
	const text = input.replace(/^\uFEFF/, '');
	const rows: Array<Array<string>> = [];
	let row: Array<string> = [];
	let field = '';
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"' && text[i + 1] === '"') {
				field += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				field += char;
			}
		} else if (char === '"' && field === '') {
			inQuotes = true;
		} else if (char === delimiter) {
			row.push(field);
			field = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else {
			field += char;
		}
	}

	if (field !== '' || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	// Ignore empty lines, e.g. the trailing newline
	return rows.filter((fields) => fields.some((value) => value.trim() !== ''));
};

// ---------------------------------------------------------------------------
// Reading values
// ---------------------------------------------------------------------------

/**
 * Accepts 1234.5, 1234,5, 1.234,5 and 1,234.5: when both separators appear, the last one is
 * the decimal separator. A lone comma is a decimal comma, as Dutch Excel writes it.
 */
export const parseNumber = (value: string): null | number => {
	let text = value.trim().replace(/\s/g, '');
	if (!/^-?[\d.,]+$/.test(text)) return null;

	const lastComma = text.lastIndexOf(',');
	const lastDot = text.lastIndexOf('.');
	if (lastComma > lastDot) {
		text = text.replace(/\./g, '').replace(',', '.');
	} else {
		text = text.replace(/,/g, '');
	}

	const number = Number(text);
	return Number.isFinite(number) ? number : null;
};

/** 2024-03-15 (the export) or 15-03-2024 / 15/3/2024 (Excel in Dutch). Stored as UTC midnight. */
export const parseDate = (value: string): null | string => {
	const text = value.trim();
	const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(text);
	const european = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text);

	const [year, month, day] = iso
		? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
		: european
			? [Number(european[3]), Number(european[2]), Number(european[1])]
			: [NaN, NaN, NaN];

	const date = new Date(Date.UTC(year, month - 1, day));
	const valid =
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
	return valid ? date.toISOString() : null;
};

// A Map, not an object: an object would also "find" built-in keys like constructor or toString
const TYPES = new Map<string, Pick<Transaction, 'transferType' | 'type'>>([
	['buy', { type: 'buy' }],
	['sell', { type: 'sell' }],
	['transfer_in', { transferType: 'in', type: 'transfer' }],
	['transfer_out', { transferType: 'out', type: 'transfer' }],
]);

/** The export prefixes text that looks like a formula with a quote; undo that. */
const plainText = (value: string): string => value.trim().replace(/^'(?=[=+\-@])/, '');

// ---------------------------------------------------------------------------
// Planning the import
// ---------------------------------------------------------------------------

export type ImportRowError = {
	/** Line number in the file, counting the header as line 1 */
	line: number;
	message: string;
};

export type ImportItem = {
	cmcId: number;
	transaction: Transaction;
};

export type ImportPlan = {
	/** Rows that are already in the portfolio (same id, or same coin, date, type, amount and total) */
	duplicates: number;
	errors: Array<ImportRowError>;
	/** A problem with the whole file, e.g. missing columns; nothing can be imported */
	fileError?: string;
	items: Array<ImportItem>;
	/** Coins in the file that aren't on the dashboard yet */
	newCoins: Array<FetchedCurrency>;
};

export type ImportOptions = {
	/** The app's currency: rows in another currency are refused, as transactions don't store one */
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrencies: Array<FetchedCurrency>;
	/** Read the exclude_for_tax column; otherwise it is ignored */
	includeTaxColumn?: boolean;
};

/** Identifies a transaction by content, for files without ids. */
const contentKey = (cmcId: number, transaction: Transaction) =>
	[
		cmcId,
		transaction.date.slice(0, 10),
		transaction.type,
		transaction.transferType ?? '',
		Number(transaction.amount),
		Number(transaction.purchasePrice).toFixed(2),
	].join('|');

const newId = () => `import_${crypto.randomUUID()}`;

/**
 * Checks every row of a CSV file against the portfolio and decides what would be imported.
 * Nothing is changed: `applyImport` does that, after the user has seen the plan.
 */
export const planImport = (
	text: string,
	existing: Array<SelectedAsset>,
	{ currencyQuote, fetchedCurrencies, includeTaxColumn = false }: ImportOptions
): ImportPlan => {
	const empty: ImportPlan = { duplicates: 0, errors: [], items: [], newCoins: [] };
	const parsed = parseCsv(text);
	if (parsed.length === 0) return { ...empty, fileError: 'This file is empty.' };
	const [header, ...rows] = parsed;

	const columns = header.map((name) => name.trim().toLowerCase());
	const column = (name: string) => columns.indexOf(name);
	const missing: Array<string> = REQUIRED_COLUMNS.filter((name) => column(name) === -1);
	if (column('cmc_id') === -1 && column('asset') === -1) missing.push('asset');
	if (missing.length > 0) {
		return {
			...empty,
			fileError: `This file is missing the column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`,
		};
	}
	if (rows.length === 0) return { ...empty, fileError: 'This file has no transactions.' };

	const byId = new Map(fetchedCurrencies.map((coin) => [coin.cmc_id, coin]));
	const byName = new Map(fetchedCurrencies.map((coin) => [coin.name.toLowerCase(), coin]));

	const existingIds = new Set(existing.flatMap((asset) => asset.transactions.map((t) => t.id)));
	const existingContent = new Set(
		existing.flatMap((asset) => asset.transactions.map((t) => contentKey(asset.cmc_id, t)))
	);
	const portfolioIds = new Set(existing.map((asset) => asset.cmc_id));

	const plan: ImportPlan = { ...empty, errors: [], items: [], newCoins: [] };
	const seenIds = new Set<string>();
	const seenContent = new Set<string>();

	rows.forEach((fields, index) => {
		const line = index + 2;
		const get = (name: string) => (column(name) === -1 ? '' : (fields[column(name)] ?? '').trim());
		const fail = (message: string) => plan.errors.push({ line, message });

		// Which coin
		const cmcIdText = get('cmc_id');
		const assetName = plainText(get('asset'));
		const coin = cmcIdText ? byId.get(Number(cmcIdText)) : byName.get(assetName.toLowerCase());
		if (!coin) {
			fail(
				`Unknown coin “${assetName || cmcIdText}”. Only coins available in Got Crypto can be imported.`
			);
			return;
		}

		// What happened
		const date = parseDate(get('date'));
		if (!date) {
			fail(`Date “${get('date')}” isn't recognized. Use 2024-03-15 or 15-03-2024.`);
			return;
		}
		if (new Date(date) > new Date()) {
			fail(`Date ${get('date')} is in the future.`);
			return;
		}
		if (new Date(date).getUTCFullYear() < EARLIEST_YEAR) {
			fail(
				`Date ${get('date')} is before ${String(EARLIEST_YEAR)}, when the first crypto was created.`
			);
			return;
		}

		const kind = TYPES.get(get('type').toLowerCase());
		if (!kind) {
			fail(`Type “${get('type')}” isn't recognized. Use buy, sell, transfer_in or transfer_out.`);
			return;
		}

		const amount = parseNumber(get('amount'));
		if (amount === null || amount <= 0) {
			fail(`Amount “${get('amount')}” must be a number greater than 0.`);
			return;
		}

		const total = parseNumber(get('total'));
		const allowsZero = kind.type === 'transfer';
		if (total === null || total < 0 || (!allowsZero && total === 0)) {
			fail(
				`Total “${get('total')}” must be a number${allowsZero ? ' of 0 or more' : ' greater than 0'}.`
			);
			return;
		}

		const currency = get('currency').toUpperCase();
		if (currency && currency !== currencyQuote) {
			fail(
				`Prices are in ${currency}, but your app uses ${currencyQuote}. Switch the currency in Settings before importing these rows.`
			);
			return;
		}

		const rawId = get('id');
		// An id that doesn't look like one is ignored, so it can't be used to store arbitrary text
		const fileId = VALID_ID.test(rawId) ? rawId : '';
		const transaction: Transaction = {
			amount: String(amount),
			date,
			description: plainText(get('description')).slice(0, MAX_DESCRIPTION_LENGTH),
			excludeForTax: includeTaxColumn && get('exclude_for_tax').toLowerCase() === 'true',
			id: fileId && !existingIds.has(fileId) && !seenIds.has(fileId) ? fileId : newId(),
			purchasePrice: total.toFixed(2),
			...kind,
		};

		// Already in the portfolio, or twice in this file
		const key = contentKey(coin.cmc_id, transaction);
		if (
			(fileId && (existingIds.has(fileId) || seenIds.has(fileId))) ||
			existingContent.has(key) ||
			seenContent.has(key)
		) {
			plan.duplicates++;
			return;
		}
		if (fileId) seenIds.add(fileId);
		seenContent.add(key);

		plan.items.push({ cmcId: coin.cmc_id, transaction });
		if (!portfolioIds.has(coin.cmc_id) && !plan.newCoins.some((c) => c.cmc_id === coin.cmc_id)) {
			plan.newCoins.push(coin);
		}
	});

	return plan;
};

// ---------------------------------------------------------------------------
// Applying it
// ---------------------------------------------------------------------------

/**
 * Adds the planned transactions to the portfolio. Existing transactions are never changed or
 * removed; coins that aren't on the dashboard yet are added to it.
 */
export const applyImport = (
	existing: Array<SelectedAsset>,
	plan: ImportPlan
): Array<SelectedAsset> => {
	const added = new Map<number, Array<Transaction>>();
	for (const { cmcId, transaction } of plan.items) {
		added.set(cmcId, [...(added.get(cmcId) ?? []), transaction]);
	}

	const withNewest = (transactions: Array<Transaction>) =>
		[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const updated = existing.map((asset) => {
		const extra = added.get(asset.cmc_id);
		if (!extra) return asset;
		const transactions = withNewest([...asset.transactions, ...extra]);
		return { ...asset, totals: totals(transactions), transactions };
	});

	const created = plan.newCoins.map((coin, offset): SelectedAsset => {
		const transactions = withNewest(added.get(coin.cmc_id) ?? []);
		return {
			cmc_id: coin.cmc_id,
			index: existing.length + offset,
			name: coin.name,
			slug: coin.slug,
			totals: totals(transactions),
			transactions,
		};
	});

	return [...updated, ...created];
};

/** Roughly how large the portfolio is when saved (Firestore stores it about as compactly as JSON). */
export const estimatePortfolioBytes = (assets: Array<SelectedAsset>): number =>
	new TextEncoder().encode(JSON.stringify(assets)).length;
