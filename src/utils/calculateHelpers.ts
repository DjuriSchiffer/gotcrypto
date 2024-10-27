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
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currencyQuote,
  }).format(data);
}

/**
 * Formats a date string into 'dd-mm-yy' format using Dutch locale.
 * @param d - The date to format.
 * @returns The formatted date string.
 */
export function dateFormat(d: string | number | Date): string {
  const date = new Date(d);
  return date.toLocaleDateString('nl', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formats a Date object into 'yyyy-mm-dd' format for date pickers.
 * @param date - The Date object to format.
 * @returns The formatted date string.
 */
export function formatDatePickerDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
}
