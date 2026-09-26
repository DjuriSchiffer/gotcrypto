import { describe, expect, it } from 'vitest';

import type { FormInputs } from '../components/TransactionForm';
import type { SelectedAsset } from '../types/currency';

import { asset, buy } from '../test/factories';
import { transactionFromForm, upsertTransaction } from './transactions';

const form = (overrides: Partial<FormInputs> = {}): FormInputs => ({
	amount: '1',
	date: '2024-03-15T00:00:00.000Z',
	purchasePrice: '10000',
	transactionType: 'buy',
	...overrides,
});

const bitcoin = { cmc_id: 1, name: 'Bitcoin', slug: 'bitcoin' };

describe('transactionFromForm', () => {
	it('creates a buy transaction with a new id', () => {
		const transaction = transactionFromForm(form());

		expect(transaction).toMatchObject({
			amount: '1',
			date: '2024-03-15T00:00:00.000Z',
			description: '',
			excludeForTax: false,
			purchasePrice: '10000.00',
			type: 'buy',
		});
		expect(transaction.id).toMatch(/^trans_/);
		expect(transaction).not.toHaveProperty('transferType');
	});

	it('accepts a comma as decimal separator', () => {
		const transaction = transactionFromForm(form({ amount: '0,5', purchasePrice: '1234,5' }));

		expect(transaction.amount).toBe('0.5');
		expect(transaction.purchasePrice).toBe('1234.50');
	});

	it('stores negative input as positive; the type decides the direction', () => {
		const transaction = transactionFromForm(form({ amount: '-2', purchasePrice: '-100' }));

		expect(transaction.amount).toBe('2');
		expect(transaction.purchasePrice).toBe('100.00');
	});

	it('keeps the id when editing', () => {
		expect(transactionFromForm(form(), 'existing_id').id).toBe('existing_id');
	});

	it('adds a transfer direction only for transfers, defaulting to in', () => {
		expect(transactionFromForm(form({ transactionType: 'transfer' })).transferType).toBe('in');
		expect(
			transactionFromForm(form({ transactionType: 'transfer', transferType: 'out' })).transferType
		).toBe('out');
	});
});

describe('upsertTransaction', () => {
	it('creates a complete asset when none is stored yet', () => {
		const result = upsertTransaction(undefined, bitcoin, buy(1, 10000), 3);

		expect(result).toMatchObject({ cmc_id: 1, index: 3, name: 'Bitcoin', slug: 'bitcoin' });
		expect(result.transactions).toHaveLength(1);
		expect(result.totals.totalAmount).toBe(1);
	});

	it('fills in a missing slug on an asset created by the asset picker', () => {
		const fromPicker = { cmc_id: 1, name: 'Bitcoin', transactions: [] } as unknown as SelectedAsset;

		expect(upsertTransaction(fromPicker, bitcoin, buy(1, 10000)).slug).toBe('bitcoin');
	});

	it('adds a transaction and recalculates the totals', () => {
		const existing = asset(1, [buy(1, 10000, '2024-01-01')]);
		const result = upsertTransaction(existing, bitcoin, buy(1, 20000, '2024-02-01'));

		expect(result.transactions).toHaveLength(2);
		expect(result.totals).toMatchObject({ totalAmount: 2, totalCostBasis: 30000 });
	});

	it('replaces a transaction with the same id', () => {
		const original = buy(1, 10000);
		const edited = { ...original, purchasePrice: '12000' };
		const result = upsertTransaction(asset(1, [original]), bitcoin, edited);

		expect(result.transactions).toHaveLength(1);
		expect(result.totals.totalCostBasis).toBe(12000);
	});

	it('keeps transactions sorted newest first', () => {
		const existing = asset(1, [buy(1, 100, '2024-06-01')]);
		const result = upsertTransaction(existing, bitcoin, buy(1, 100, '2024-01-01'));

		expect(result.transactions.map((item) => item.date.slice(0, 10))).toEqual([
			'2024-06-01',
			'2024-01-01',
		]);
	});

	it('does not change the original asset', () => {
		const existing = asset(1, [buy(1, 10000)]);
		const before = structuredClone(existing);

		upsertTransaction(existing, bitcoin, buy(1, 20000));

		expect(existing).toEqual(before);
	});
});
