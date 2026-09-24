import { afterEach, describe, expect, it } from 'vitest';

import {
	amountFormat,
	averagePurchasePrice,
	currencyFormat,
	dateForDisplay,
	dateToStorage,
	displayToStorage,
	percentageDifference,
	percentageFormat,
	profitClass,
} from './helpers';

/** Intl uses non-breaking spaces in some locales; normalize them for readable assertions. */
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('percentageDifference', () => {
	it('calculates the gain or loss in percent', () => {
		expect(percentageDifference(1000, 1500)).toBe(50);
		expect(percentageDifference(1000, 750)).toBe(-25);
	});

	it('rounds to two decimals', () => {
		expect(percentageDifference(3, 4)).toBe(33.33);
	});

	it('returns 0 when there is no purchase price', () => {
		expect(percentageDifference(0, 1500)).toBe(0);
	});

	it('returns -100 when the value dropped to zero', () => {
		expect(percentageDifference(1000, 0)).toBe(-100);
	});
});

describe('percentageFormat', () => {
	it('formats with two decimals and a percent sign', () => {
		expect(percentageFormat(12.5)).toBe('12.50%');
		expect(percentageFormat('-3.456')).toBe('-3.46%');
	});
});

describe('averagePurchasePrice', () => {
	it('divides price by amount', () => {
		expect(averagePurchasePrice(1000, 4)).toBe(250);
	});

	it('returns 0 instead of dividing by zero', () => {
		expect(averagePurchasePrice(1000, 0)).toBe(0);
	});
});

describe('currencyFormat', () => {
	it('formats EUR the Dutch way', () => {
		expect(plain(currencyFormat(1500.5, 'EUR'))).toBe('€ 1.500,50');
	});

	it('formats USD the American way', () => {
		expect(currencyFormat(1500.5, 'USD')).toBe('$1,500.50');
	});

	it('shows enough decimals for sub-cent prices', () => {
		expect(plain(currencyFormat(0.000123, 'EUR'))).toBe('€ 0,00012');
	});

	it('respects an explicit number of decimals', () => {
		expect(currencyFormat(1.23456, 'USD', 4)).toBe('$1.2346');
	});

	it('shows negative values', () => {
		expect(plain(currencyFormat(-2500, 'EUR'))).toBe('€ -2.500,00');
	});

	it('can force a positive value to display as negative', () => {
		expect(plain(currencyFormat(100, 'EUR', undefined, true))).toBe('€ -100,00');
	});
});

describe('amountFormat', () => {
	it('uses the same locale as prices', () => {
		expect(amountFormat(0.5, 'EUR')).toBe('0,5');
		expect(amountFormat(0.5, 'USD')).toBe('0.5');
	});

	it('keeps up to 8 decimals', () => {
		expect(amountFormat(1234.12345678, 'USD')).toBe('1,234.12345678');
		expect(amountFormat(0.123456789, 'USD')).toBe('0.12345679');
	});
});

describe('profitClass', () => {
	it('colors gains green, losses red, and zero neither', () => {
		expect(profitClass(10)).toBe('text-green-500');
		expect(profitClass(-10)).toBe('text-red-500');
		expect(profitClass(0)).toBe('');
	});
});

describe('dates', () => {
	const originalTimezone = process.env.TZ;

	afterEach(() => {
		process.env.TZ = originalTimezone;
	});

	// Amsterdam is where the app was built; New York and Auckland are the edge cases
	describe.each(['Europe/Amsterdam', 'America/New_York', 'Pacific/Auckland'])(
		'in %s',
		(timezone) => {
			it('stores the calendar day the user picked', () => {
				process.env.TZ = timezone;
				const lateEvening = new Date(2024, 2, 15, 23, 30); // local time

				expect(dateToStorage(lateEvening)).toBe('2024-03-15T00:00:00.000Z');
			});

			it('keeps a stored date unchanged when it is saved again', () => {
				process.env.TZ = timezone;

				expect(dateToStorage('2024-03-15T00:00:00.000Z')).toBe('2024-03-15T00:00:00.000Z');
				expect(displayToStorage('2024-03-15T00:00:00.000Z')).toBe('2024-03-15T00:00:00.000Z');
			});

			it('displays the stored day', () => {
				process.env.TZ = timezone;

				expect(dateForDisplay('2024-03-15T00:00:00.000Z', 'nl')).toBe('15-03-2024');
				expect(dateForDisplay('2024-03-15T00:00:00.000Z', 'en')).toBe('03/15/2024');
			});
		}
	);

	it('returns an empty string for an invalid date', () => {
		expect(dateForDisplay('not a date')).toBe('');
	});
});
