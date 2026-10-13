import { describe, expect, it } from 'vitest';

import type { Transaction } from '../types/currency';

import { asset, buy, sell, transferIn, transferOut } from '../test/factories';
import { CSV_COLUMNS, exportFileName, transactionsToCsv } from './csvExport';

/** The CSV as rows of fields, without the BOM. Only for simple, unquoted test data. */
const parse = (csv: string) =>
	csv
		.replace(/^\uFEFF/, '')
		.trim()
		.split('\r\n')
		.map((line) => line.split(','));

const withExtras = (transaction: Transaction, extras: Partial<Transaction>): Transaction => ({
	...transaction,
	...extras,
});

describe('transactionsToCsv', () => {
	it('starts with a BOM and a header row', () => {
		const csv = transactionsToCsv([], 'EUR');

		expect(csv.startsWith('\uFEFF')).toBe(true);
		expect(parse(csv)).toEqual([CSV_COLUMNS.filter((column) => column !== 'exclude_for_tax')]);
	});

	it('writes one row per transaction with plain numbers and ISO dates', () => {
		const transaction = buy(0.5, 15000.5, '2024-03-15');
		const [, row] = parse(
			transactionsToCsv([asset(1, [transaction], 'Bitcoin')], 'EUR', { includeTaxColumn: true })
		);

		expect(row).toEqual([
			'2024-03-15',
			'Bitcoin',
			'1',
			'buy',
			'0.5',
			'15000.5',
			'30001',
			'EUR',
			'false',
			'',
			transaction.id,
		]);
	});

	it('names every transaction type', () => {
		const rows = parse(
			transactionsToCsv(
				[
					asset(1, [
						buy(1, 100, '2024-01-01'),
						sell(1, 100, '2024-01-02'),
						transferIn(1, 100, '2024-01-03'),
						transferOut(1, 100, '2024-01-04'),
					]),
				],
				'USD'
			)
		);

		expect(rows.slice(1).map((row) => row[3])).toEqual([
			'buy',
			'sell',
			'transfer_in',
			'transfer_out',
		]);
		expect(rows[1][7]).toBe('USD');
	});

	it('sorts all assets together, oldest first', () => {
		const rows = parse(
			transactionsToCsv(
				[
					asset(1, [buy(1, 1, '2024-06-01'), buy(1, 1, '2022-01-01')], 'Bitcoin'),
					asset(2, [buy(1, 1, '2023-01-01')], 'Ethereum'),
				],
				'EUR'
			)
		);

		expect(rows.slice(1).map((row) => `${row[0]} ${row[1]}`)).toEqual([
			'2022-01-01 Bitcoin',
			'2023-01-01 Ethereum',
			'2024-06-01 Bitcoin',
		]);
	});

	it('writes very small amounts without scientific notation', () => {
		const [, row] = parse(transactionsToCsv([asset(1, [buy(0.00000123, 0.05)])], 'EUR'));

		expect(row[4]).toBe('0.00000123');
	});

	it('quotes descriptions with commas, quotes and line breaks', () => {
		const transaction = withExtras(buy(1, 100), { description: 'DCA, week 1\n"monthly"' });
		const csv = transactionsToCsv([asset(1, [transaction])], 'EUR');

		expect(csv).toContain('"DCA, week 1\n""monthly"""');
	});

	it('keeps descriptions that look like formulas as plain text', () => {
		const transaction = withExtras(buy(1, 100), {
			description: '=HYPERLINK("https://evil.example")',
		});
		const csv = transactionsToCsv([asset(1, [transaction])], 'EUR');

		expect(csv).toContain(`"'=HYPERLINK(""https://evil.example"")"`);
	});

	it('marks transactions excluded for tax when the tax column is included', () => {
		const transaction = withExtras(buy(1, 100), { excludeForTax: true });
		const [header, row] = parse(
			transactionsToCsv([asset(1, [transaction])], 'EUR', { includeTaxColumn: true })
		);

		expect(row[header.indexOf('exclude_for_tax')]).toBe('true');
	});

	it('leaves the tax column out by default, even for flagged transactions', () => {
		const transaction = withExtras(buy(1, 100), { excludeForTax: true });
		const csv = transactionsToCsv([asset(1, [transaction])], 'EUR');

		expect(csv).not.toContain('exclude_for_tax');
		expect(parse(csv)[1]).not.toContain('true');
	});

	it('leaves out assets without transactions', () => {
		expect(parse(transactionsToCsv([asset(1), asset(2)], 'EUR'))).toHaveLength(1);
	});
});

describe('exportFileName', () => {
	it('includes the date', () => {
		expect(exportFileName(new Date('2026-10-13T12:00:00Z'))).toBe(
			'gotcrypto-transactions-2026-10-13.csv'
		);
	});
});
