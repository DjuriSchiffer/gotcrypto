import type { FetchedCurrency, SelectedAsset } from '../types/currency';

import { percentageFormat } from './helpers';

export type DayChange = {
	/** In money: what the current holdings gained or lost in value */
	change: number;
	/** In percent, compared to their value 24 hours ago */
	percentage: number;
};

/** A percentage with a plus sign for gains, e.g. "+2.10%". */
export const signedPercentage = (percentage: number): string =>
	`${percentage > 0 ? '+' : ''}${percentageFormat(percentage)}`;

/**
 * How much the coins you hold now changed in value over the last 24 hours, from price moves
 * alone. Coins without a price or without a 24h change are left out; null when none is left.
 */
export const getPortfolioDayChange = (
	selectedCurrencies: Array<SelectedAsset>,
	fetchedCurrencies: Array<FetchedCurrency> | null | undefined
): DayChange | null => {
	const byId = new Map((fetchedCurrencies ?? []).map((coin) => [coin.cmc_id, coin]));

	let now = 0;
	let before = 0;
	for (const asset of selectedCurrencies) {
		const coin = byId.get(asset.cmc_id);
		const percentage = coin?.change24h;
		if (!coin || typeof percentage !== 'number' || percentage <= -100) continue;
		if (asset.totals.totalAmount <= 0) continue;

		const value = asset.totals.totalAmount * coin.price;
		now += value;
		before += value / (1 + percentage / 100);
	}

	if (before <= 0) return null;

	const change = now - before;
	return {
		change: Math.round(change * 100) / 100,
		percentage: Math.round((change / before) * 10000) / 100,
	};
};
