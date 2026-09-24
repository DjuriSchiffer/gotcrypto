import type { CurrencyQuote } from 'api';
import type { DashboardLayout, DateLocale, SortMethod } from 'store';

export type Preferences = {
	currencyQuote: keyof CurrencyQuote;
	dashboardLayout: DashboardLayout;
	dateLocale: DateLocale;
	onboardingCompleted: boolean;
	sortMethod: SortMethod;
};

export const DEFAULT_PREFERENCES: Preferences = {
	currencyQuote: 'EUR',
	dashboardLayout: 'Grid',
	dateLocale: 'nl',
	onboardingCompleted: false,
	sortMethod: 'has_selected',
};

/** Returns `value` if it is one of the allowed options, otherwise the fallback. */
const oneOf = <T extends string>(value: unknown, allowed: ReadonlyArray<T>, fallback: T): T =>
	typeof value === 'string' && (allowed as ReadonlyArray<string>).includes(value)
		? (value as T)
		: fallback;

/**
 * Turns whatever is stored (a Firestore document, localforage values, or nothing)
 * into a complete, valid set of preferences. Missing or unknown values get the default.
 */
export const readPreferences = (raw: null | Record<string, unknown> | undefined): Preferences => ({
	currencyQuote: oneOf(raw?.currencyQuote, ['EUR', 'USD'], DEFAULT_PREFERENCES.currencyQuote),
	dashboardLayout: oneOf(
		raw?.dashboardLayout,
		['Grid', 'Table'],
		DEFAULT_PREFERENCES.dashboardLayout
	),
	dateLocale: oneOf(raw?.dateLocale, ['en', 'nl'], DEFAULT_PREFERENCES.dateLocale),
	onboardingCompleted: raw?.onboardingCompleted === true,
	sortMethod: oneOf(raw?.sortMethod, ['cmc_rank', 'has_selected'], DEFAULT_PREFERENCES.sortMethod),
});
