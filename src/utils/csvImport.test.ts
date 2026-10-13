import { describe, expect, it } from 'vitest';

import type { FetchedCurrency, Transaction } from '../types/currency';

import { asset, buy, sell, transferIn, transferOut } from '../test/factories';
import { transactionsToCsv } from './csvExport';
import {
	applyImport,
	detectDelimiter,
	estimatePortfolioBytes,
	MAX_DESCRIPTION_LENGTH,
	MAX_PORTFOLIO_BYTES,
	parseCsv,
	parseDate,
	parseNumber,
	planImport,
} from './csvImport';

const coins: Array<FetchedCurrency> = [
	{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
	{ cmc_id: 1027, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
];
const options = { currencyQuote: 'EUR' as const, fetchedCurrencies: coins };

const HEADER = 'date,asset,cmc_id,type,amount,total,currency,description,id';
const csv = (...lines: Array<string>) => [HEADER, ...lines].join('\n');

describe('parseCsv', () => {
	it('splits rows and fields, ignoring a BOM and empty lines', () => {
		expect(parseCsv('\uFEFFa,b\r\n1,2\r\n\r\n')).toEqual([
			['a', 'b'],
			['1', '2'],
		]);
	});

	it('handles quoted fields with commas, quotes and line breaks', () => {
		expect(parseCsv('a,b\n"x, y","say ""hi""\nthere"')).toEqual([
			['a', 'b'],
			['x, y', 'say "hi"\nthere'],
		]);
	});

	it('reads semicolon files, as Dutch Excel saves them', () => {
		expect(detectDelimiter('date;asset;amount\n')).toBe(';');
		expect(detectDelimiter('date,asset,amount\n')).toBe(',');
		expect(parseCsv('a;b\n"1;2";3')).toEqual([
			['a', 'b'],
			['1;2', '3'],
		]);
	});
});

describe('parseNumber', () => {
	it.each([
		['1234.5', 1234.5],
		['1234,5', 1234.5],
		['1.234,56', 1234.56],
		['1,234.56', 1234.56],
		['0.00000123', 0.00000123],
		[' 42 ', 42],
	])('reads %s', (input, expected) => {
		expect(parseNumber(input)).toBe(expected);
	});

	it('rejects text', () => {
		expect(parseNumber('abc')).toBeNull();
		expect(parseNumber('')).toBeNull();
		expect(parseNumber('€ 10')).toBeNull();
	});
});

describe('parseDate', () => {
	it('reads ISO and Dutch dates as UTC midnight', () => {
		expect(parseDate('2024-03-15')).toBe('2024-03-15T00:00:00.000Z');
		expect(parseDate('15-03-2024')).toBe('2024-03-15T00:00:00.000Z');
		expect(parseDate('5/3/2024')).toBe('2024-03-05T00:00:00.000Z');
		expect(parseDate('2024-03-15T00:00:00.000Z')).toBe('2024-03-15T00:00:00.000Z');
	});

	it('rejects impossible or unknown dates', () => {
		expect(parseDate('2024-02-30')).toBeNull();
		expect(parseDate('31-31-2024')).toBeNull();
		expect(parseDate('March 15')).toBeNull();
	});
});

describe('planImport', () => {
	it('plans every valid row', () => {
		const plan = planImport(
			csv(
				'2024-03-15,Bitcoin,1,buy,0.5,15000,EUR,DCA,',
				'2024-04-01,Ethereum,1027,transfer_out,2,0,EUR,,'
			),
			[],
			options
		);

		expect(plan.errors).toEqual([]);
		expect(plan.items).toHaveLength(2);
		expect(plan.items[0]).toMatchObject({
			cmcId: 1,
			transaction: {
				amount: '0.5',
				date: '2024-03-15T00:00:00.000Z',
				description: 'DCA',
				purchasePrice: '15000.00',
				type: 'buy',
			},
		});
		expect(plan.items[1].transaction).toMatchObject({ transferType: 'out', type: 'transfer' });
		expect(plan.newCoins.map((coin) => coin.name)).toEqual(['Bitcoin', 'Ethereum']);
	});

	it('finds the coin by name when there is no cmc_id column', () => {
		const plan = planImport(
			'date,asset,type,amount,total\n2024-01-01,bitcoin,buy,1,100',
			[],
			options
		);

		expect(plan.items[0].cmcId).toBe(1);
	});

	it('explains every row it skips, with its line number', () => {
		const plan = planImport(
			csv(
				'2024-01-01,Dogecoin,999,buy,1,1,EUR,,',
				'2024-13-01,Bitcoin,1,buy,1,1,EUR,,',
				'2024-01-01,Bitcoin,1,swap,1,1,EUR,,',
				'2024-01-01,Bitcoin,1,buy,0,1,EUR,,',
				'2024-01-01,Bitcoin,1,sell,1,0,EUR,,',
				'2099-01-01,Bitcoin,1,buy,1,1,EUR,,'
			),
			[],
			options
		);

		expect(plan.items).toEqual([]);
		expect(plan.errors.map((error) => error.line)).toEqual([2, 3, 4, 5, 6, 7]);
		expect(plan.errors.map((error) => error.message)).toEqual([
			expect.stringMatching(/Unknown coin “Dogecoin”/),
			expect.stringMatching(/Date “2024-13-01”/),
			expect.stringMatching(/Type “swap”/),
			expect.stringMatching(/Amount “0”/),
			expect.stringMatching(/Total “0” must be a number greater than 0/),
			expect.stringMatching(/in the future/),
		]);
	});

	it('refuses rows in another currency instead of misreading their prices', () => {
		const plan = planImport(csv('2024-01-01,Bitcoin,1,buy,1,40000,USD,,'), [], options);

		expect(plan.items).toEqual([]);
		expect(plan.errors[0].message).toMatch(/in USD, but your app uses EUR/);
	});

	it('skips transactions that are already in the portfolio', () => {
		const existing = buy(1, 100, '2024-01-01');
		const portfolio = [asset(1, [existing], 'Bitcoin')];

		const plan = planImport(
			csv(
				`2024-06-01,Bitcoin,1,buy,9,9,EUR,,${existing.id}`, // same id
				'2024-01-01,Bitcoin,1,buy,1,100,EUR,,', // same content
				'2024-02-01,Bitcoin,1,buy,1,100,EUR,,', // new
				'2024-02-01,Bitcoin,1,buy,1,100,EUR,,' // twice in this file
			),
			portfolio,
			options
		);

		expect(plan.duplicates).toBe(3);
		expect(plan.items).toHaveLength(1);
		expect(plan.newCoins).toEqual([]); // Bitcoin is already on the dashboard
	});

	it('only reads the tax column when allowed to', () => {
		const file = 'date,asset,type,amount,total,exclude_for_tax\n2024-01-01,Bitcoin,buy,1,100,true';

		expect(planImport(file, [], options).items[0].transaction.excludeForTax).toBe(false);
		expect(
			planImport(file, [], { ...options, includeTaxColumn: true }).items[0].transaction
				.excludeForTax
		).toBe(true);
	});

	it('undoes the formula protection from the export', () => {
		const plan = planImport(csv(`2024-01-01,Bitcoin,1,buy,1,1,EUR,"'=SUM(1)",`), [], options);

		expect(plan.items[0].transaction.description).toBe('=SUM(1)');
	});

	it('reports a file without the required columns', () => {
		expect(planImport('name,value\nx,1', [], options).fileError).toBe(
			'This file is missing the columns: date, type, amount, total, asset.'
		);
		expect(planImport('', [], options).fileError).toBe('This file is empty.');
		expect(planImport(HEADER, [], options).fileError).toBe('This file has no transactions.');
	});

	it('reads a file re-saved by Dutch Excel', () => {
		const excel =
			'date;asset;cmc_id;type;amount;total;currency\n15-03-2024;Bitcoin;1;buy;0,5;15000,5;EUR';
		const plan = planImport(excel, [], options);

		expect(plan.errors).toEqual([]);
		expect(plan.items[0].transaction).toMatchObject({
			amount: '0.5',
			date: '2024-03-15T00:00:00.000Z',
			purchasePrice: '15000.50',
		});
	});
});

describe('export and import together', () => {
	const withDescription = (transaction: Transaction, description: string) => ({
		...transaction,
		description,
	});
	const portfolio = [
		asset(
			1,
			[
				buy(1, 10000, '2023-01-01'),
				withDescription(sell(0.5, 30000, '2024-01-01'), 'Took profit, finally'),
			],
			'Bitcoin'
		),
		asset(1027, [transferIn(10, 20000, '2023-06-01'), transferOut(2, 0, '2024-06-01')], 'Ethereum'),
	];

	it('restores the same transactions into an empty account', () => {
		const file = transactionsToCsv(portfolio, 'EUR');
		const plan = planImport(file, [], options);
		const restored = applyImport([], plan);

		expect(plan.errors).toEqual([]);
		const strip = (transactions: Array<Transaction>) =>
			transactions.map(({ amount, date, description, purchasePrice, transferType, type }) => ({
				amount: Number(amount),
				date,
				description: description ?? '',
				purchasePrice: Number(purchasePrice),
				transferType,
				type,
			}));
		for (const original of portfolio) {
			const copy = restored.find((item) => item.cmc_id === original.cmc_id);
			expect(strip(copy?.transactions ?? [])).toEqual(
				strip(original.transactions).sort((a, b) => b.date.localeCompare(a.date))
			);
			expect(copy?.totals).toEqual(original.totals);
		}
	});

	it('adds nothing when the same file is imported again', () => {
		const plan = planImport(transactionsToCsv(portfolio, 'EUR'), portfolio, options);

		expect(plan.items).toEqual([]);
		expect(plan.duplicates).toBe(4);
	});
});

describe('applyImport', () => {
	it('adds to existing assets and creates new ones, without touching the rest', () => {
		const bitcoin = asset(1, [buy(1, 100, '2023-01-01')], 'Bitcoin');
		const plan = planImport(
			csv('2024-01-01,Bitcoin,1,buy,1,200,EUR,,', '2024-01-01,Ethereum,1027,buy,10,3000,EUR,,'),
			[bitcoin],
			options
		);

		const result = applyImport([bitcoin], plan);

		expect(result.map((item) => item.slug)).toEqual(['bitcoin', 'ethereum']);
		expect(result[0].transactions).toHaveLength(2);
		expect(result[0].transactions[1]).toBe(bitcoin.transactions[0]); // unchanged, oldest last
		expect(result[0].totals.totalCostBasis).toBe(300);
		expect(result[1]).toMatchObject({ cmc_id: 1027, index: 1, name: 'Ethereum' });
		expect(result[1].totals.totalAmount).toBe(10);
	});
});

describe('defenses against crafted files', () => {
	it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty'])(
		'refuses the built-in object key “%s” as a type',
		(type) => {
			const plan = planImport(
				`date,asset,type,amount,total\n2024-01-01,Bitcoin,${type},1,100`,
				[],
				options
			);

			expect(plan.items).toEqual([]);
			expect(plan.errors[0].message).toMatch(/isn't recognized/);
		}
	);

	it('cuts off very long descriptions', () => {
		const long = 'x'.repeat(5000);
		const plan = planImport(
			`date,asset,type,amount,total,description\n2024-01-01,Bitcoin,buy,1,100,${long}`,
			[],
			options
		);

		expect(plan.items[0].transaction.description).toHaveLength(MAX_DESCRIPTION_LENGTH);
	});

	it('replaces ids that do not look like ids', () => {
		const plan = planImport(
			`date,asset,type,amount,total,id\n2024-01-01,Bitcoin,buy,1,100,${'<b>'.repeat(10)}\n2024-01-02,Bitcoin,buy,1,100,${'a'.repeat(500)}\n2024-01-03,Bitcoin,buy,1,100,trans_123_4`,
			[],
			options
		);

		expect(plan.items.map((item) => item.transaction.id.startsWith('import_'))).toEqual([
			true,
			true,
			false,
		]);
		expect(plan.items[2].transaction.id).toBe('trans_123_4');
	});

	it('refuses dates before crypto existed', () => {
		const plan = planImport(
			'date,asset,type,amount,total\n1999-01-01,Bitcoin,buy,1,100',
			[],
			options
		);

		expect(plan.errors[0].message).toMatch(/before 2009/);
	});

	it('treats an absurdly long number as invalid', () => {
		const plan = planImport(
			`date,asset,type,amount,total\n2024-01-01,Bitcoin,buy,${'9'.repeat(400)},100`,
			[],
			options
		);

		expect(plan.errors[0].message).toMatch(/Amount/);
	});

	it('estimates the saved size of a portfolio', () => {
		const small = estimatePortfolioBytes([asset(1, [buy(1, 100)])]);
		const large = estimatePortfolioBytes([
			asset(
				1,
				Array.from({ length: 10000 }, () => buy(1, 100))
			),
		]);

		expect(small).toBeLessThan(2000);
		expect(large).toBeGreaterThan(MAX_PORTFOLIO_BYTES);
	});
});
