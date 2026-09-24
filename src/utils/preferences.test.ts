import { describe, expect, it } from 'vitest';

import { DEFAULT_PREFERENCES, readPreferences } from './preferences';

describe('readPreferences', () => {
	it('returns the defaults when nothing is stored', () => {
		expect(readPreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
		expect(readPreferences(null)).toEqual(DEFAULT_PREFERENCES);
		expect(readPreferences({})).toEqual(DEFAULT_PREFERENCES);
	});

	it('keeps valid stored values', () => {
		expect(
			readPreferences({
				currencyQuote: 'USD',
				dashboardLayout: 'Table',
				dateLocale: 'en',
				onboardingCompleted: true,
				sortMethod: 'cmc_rank',
			})
		).toEqual({
			currencyQuote: 'USD',
			dashboardLayout: 'Table',
			dateLocale: 'en',
			onboardingCompleted: true,
			sortMethod: 'cmc_rank',
		});
	});

	it('fills in missing fields, like a new user document that only has currencies', () => {
		expect(readPreferences({ currencyQuote: 'USD', selectedCurrencies: [] })).toEqual({
			...DEFAULT_PREFERENCES,
			currencyQuote: 'USD',
		});
	});

	it('replaces unknown or wrongly typed values with the default', () => {
		expect(
			readPreferences({ currencyQuote: 'GBP', dashboardLayout: 42, dateLocale: null })
		).toEqual(DEFAULT_PREFERENCES);
	});

	it('only treats a real `true` as completed onboarding', () => {
		expect(readPreferences({ onboardingCompleted: 'true' }).onboardingCompleted).toBe(false);
		expect(readPreferences({ onboardingCompleted: 1 }).onboardingCompleted).toBe(false);
		expect(readPreferences({ onboardingCompleted: true }).onboardingCompleted).toBe(true);
	});
});
