import type { CurrencyQuote } from 'api';

import { dateToStorage } from './helpers';

/** CoinMarketCap's ids for the currencies prices are converted to */
export const CONVERT_IDS: Record<keyof CurrencyQuote, number> = { EUR: 2790, USD: 2781 };

/** The API has no prices before this */
const EARLIEST = Date.UTC(2010, 0, 1);
const HOUR = 60 * 60 * 1000;

/**
 * Where the price for a transaction date comes from:
 * - today: the current price the app already has (no request needed)
 * - an earlier day: the historical price at 12:00 UTC that day, closer to a typical trade than midnight
 * - null: no usable date (empty, invalid, in the future, or before 2010)
 *
 * `storageDate` is a date as the form stores it: midnight UTC of the chosen day.
 */
export type PriceSource = { kind: 'current' } | { kind: 'historical'; timestamp: number };

export const priceSourceFor = (storageDate: string, now: Date = new Date()): null | PriceSource => {
	const day = Date.parse(storageDate);
	if (Number.isNaN(day) || day < EARLIEST) return null;

	const today = Date.parse(dateToStorage(now));
	if (day > today) return null;
	if (day === today) return { kind: 'current' };

	// 12:00 UTC, but never in the future (yesterday evening in the Americas can be "today" in UTC)
	const noon = Math.min(day + 12 * HOUR, now.getTime() - HOUR);
	return { kind: 'historical', timestamp: Math.floor(noon / 1000) };
};

/** The quantity as typed in the form, or null if it isn't a positive number. */
export const parseQuantity = (amount: string): null | number => {
	const quantity = parseFloat(amount.replace(',', '.'));
	return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
};

/** What `quantity` coins cost at `pricePerCoin`, rounded to cents (the form's price field is a total). */
export const suggestedTotal = (quantity: number, pricePerCoin: number): number =>
	Math.round(quantity * pricePerCoin * 100) / 100;
