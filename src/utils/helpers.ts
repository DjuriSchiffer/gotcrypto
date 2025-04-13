import type { CurrencyQuote } from 'api';
import type { SelectedAsset } from 'currency';

/**
 * Calculates the percentage difference between purchase price and current value.
 * @param purchasePrice - The total purchase price.
 * @param currentValue - The current total value.
 * @returns The percentage difference as a number.
 */
export function percentageDifference(purchasePrice: number, currentValue: number): number {
	if (purchasePrice === 0 || currentValue === 0) return 0;
	const difference = (currentValue * 100) / purchasePrice - 100;
	return parseFloat(difference.toFixed(2));
}

/**
 * Formats a number as a percentage string with two decimal places.
 * @param data - The number or string to format.
 * @returns The formatted percentage string.
 */
export function percentageFormat(data: number | string): string {
	return `${parseFloat(data.toString()).toFixed(2)}%`;
}

/**
 * Calculates the current value based on amount and current price.
 * @param amount - The amount of currency.
 * @param currentPrice - The current price of the currency.
 * @returns The current value as a number.
 */
export function currentValue(amount: number, currentPrice: number): number {
	return parseFloat((amount * currentPrice).toFixed(2));
}

/**
 * Calculates the profit based on current value and purchase price.
 * @param currentValue - The current total value.
 * @param purchasePrice - The total purchase price.
 * @returns The profit as a number.
 */
export function profit(currentValue: number, purchasePrice: number): number {
	return parseFloat((currentValue - purchasePrice).toFixed(2));
}

/**
 * Calculates the average purchase price.
 * @param purchasePrice - The total purchase price.
 * @param amount - The total amount.
 * @returns The average purchase price as a number.
 */
export function averagePurchasePrice(purchasePrice: number, amount: number): number {
	if (amount === 0) return 0;
	return parseFloat((purchasePrice / amount).toFixed(2));
}

/**
 * Formats a number as a currency string with flexible decimal places.
 * @param data - The number to format.
 * @param currencyQuote - The currency code (default: 'EUR').
 * @param maxDecimals - Maximum number of decimal places.
 * @returns The formatted currency string.
 */
export function currencyFormat(
	data: number,
	currencyQuote: keyof CurrencyQuote = 'EUR',
	maxDecimals?: number,
	formatNegativeValue = false
): string {
	const format = currencyQuote === 'EUR' ? 'nl-NL' : 'en-US';
	const abs = Math.abs(data);

	let decimals = 2;
	if (maxDecimals !== undefined) {
		decimals = maxDecimals;
	} else if (abs < 0.01 && abs > 0) {
		let significant = 0;
		let temp = abs;
		while (temp < 1) {
			temp *= 10;
			significant++;
		}
		decimals = significant + 1;
	}

	return new Intl.NumberFormat(format, {
		currency: currencyQuote,
		maximumFractionDigits: decimals,
		minimumFractionDigits: decimals,
		signDisplay: formatNegativeValue ? 'always' : 'auto',
		style: 'currency',
	}).format(formatNegativeValue && data > 0 ? -data : data);
}

type SupportedLocale = 'de' | 'en' | 'nl';

/**
 * Converts any date input to UTC midnight ISO string
 */
export function dateToStorage(date: Date | string): string {
	const d = new Date(date);
	const year = d.getFullYear();
	const month = d.getMonth();
	const day = d.getDate();
	return new Date(Date.UTC(year, month, day)).toISOString();
}

/**
 * Formats ISO date string for display in user's locale
 */
export function dateForDisplay(isoString: string, locale: SupportedLocale = 'nl'): string {
	try {
		const date = new Date(isoString);
		if (isNaN(date.getTime())) {
			return '';
		}

		return new Intl.DateTimeFormat(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		}).format(date);
	} catch {
		return '';
	}
}

/**
 * Converts a displayed date back to storage format
 */
export function displayToStorage(displayDate: string): string {
	const date = new Date(displayDate);
	if (!isNaN(date.getTime())) {
		return dateToStorage(date);
	}
	return dateToStorage(new Date());
}

export const createCryptoMap = (
	selectedCurrencies: Array<SelectedAsset>
): Map<number, SelectedAsset> => {
	return new Map(
		selectedCurrencies
			.filter((currency) => currency.transactions.length > 0)
			.map((currency) => [currency.cmc_id, currency])
	);
};
