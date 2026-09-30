import type { SelectedAsset } from '../types/currency';

import { readPreferences } from './preferences';

/** What an anonymous user has stored in this browser. */
export type LocalData = {
	preferences: Record<string, unknown>;
	selectedCurrencies: Array<SelectedAsset>;
};

export type MigrationPlan =
	| { fields: Record<string, unknown>; kind: 'write' }
	| { kind: 'skip'; reason: 'account-has-portfolio' };

/**
 * Decides what to copy from the browser into a Google account.
 *
 * Safety rules:
 * - An account that already has a portfolio is never written to: no overwrite, no merge.
 * - Preferences the account already has are kept; only missing ones are filled in.
 */
export const planMigration = (
	local: LocalData,
	account: Record<string, unknown> | undefined
): MigrationPlan => {
	const existing = account?.selectedCurrencies;
	if (Array.isArray(existing) && existing.length > 0) {
		return { kind: 'skip', reason: 'account-has-portfolio' };
	}

	const preferences = readPreferences(local.preferences);
	const missingPreferences = Object.fromEntries(
		Object.entries(preferences).filter(([key]) => account?.[key] === undefined)
	);

	return {
		fields: { ...missingPreferences, selectedCurrencies: local.selectedCurrencies },
		kind: 'write',
	};
};
