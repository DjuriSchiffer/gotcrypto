import { describe, expect, it } from 'vitest';

import { asset, buy } from '../test/factories';
import { planMigration } from './migration';

const local = {
	preferences: { currencyQuote: 'USD', onboardingCompleted: true },
	selectedCurrencies: [asset(1, [buy(1, 100)], 'Bitcoin')],
};

describe('planMigration', () => {
	it('copies the portfolio and preferences into a new account', () => {
		const plan = planMigration(local, undefined);

		expect(plan).toMatchObject({
			fields: {
				currencyQuote: 'USD',
				onboardingCompleted: true,
				selectedCurrencies: local.selectedCurrencies,
			},
			kind: 'write',
		});
	});

	it('also writes into an account document that exists but has an empty portfolio', () => {
		expect(planMigration(local, { selectedCurrencies: [] }).kind).toBe('write');
	});

	it('never touches an account that already has a portfolio', () => {
		const account = { selectedCurrencies: [asset(2, [buy(5, 500)], 'Ethereum')] };

		expect(planMigration(local, account)).toEqual({
			kind: 'skip',
			reason: 'account-has-portfolio',
		});
	});

	it("keeps the account's own preferences", () => {
		const plan = planMigration(local, { currencyQuote: 'EUR', selectedCurrencies: [] });

		expect(plan.kind === 'write' && plan.fields.currencyQuote).toBeUndefined();
		expect(plan.kind === 'write' && plan.fields.onboardingCompleted).toBe(true);
	});

	it('fills in defaults for invalid local preferences', () => {
		const plan = planMigration(
			{ preferences: { dateLocale: 'xx' }, selectedCurrencies: [] },
			undefined
		);

		expect(plan.kind === 'write' && plan.fields.dateLocale).toBe('nl');
	});
});
