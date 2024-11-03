import { CurrencyQuote } from "api";

/**
 * Calculates the percentage difference between purchase price and current value.
 * @param purchasePrice - The total purchase price.
 * @param currentValue - The current total value.
 * @returns The percentage difference as a number.
 */
export function percentageDifference(
  purchasePrice: number,
  currentValue: number
): number {
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
export function averagePurchasePrice(
  purchasePrice: number,
  amount: number
): number {
  if (amount === 0) return 0;
  return parseFloat((purchasePrice / amount).toFixed(2));
}

/**
 * Formats a number as a currency string in EUR with Dutch locale.
 * @param data - The number to format.
 * @returns The formatted currency string.
 */
export function currencyFormat(data: number, currencyQuote: keyof CurrencyQuote = 'EUR'): string {
  const format = currencyQuote === 'EUR' ? 'nl-NL' : 'en-US';
  return new Intl.NumberFormat(format, {
    style: 'currency',
    currency: currencyQuote,
  }).format(data);
}

type SupportedLocale = 'nl' | 'en' | 'de' | string;

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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Converts a displayed date back to storage format
 */
export function displayToStorage(displayDate: string, locale: SupportedLocale = 'nl'): string {
  const date = new Date(displayDate);
  if (!isNaN(date.getTime())) {
    return dateToStorage(date);
  }
  return dateToStorage(new Date());
}