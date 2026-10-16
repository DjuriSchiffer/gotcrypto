import { describe, expect, it } from 'vitest';

import { dateToStorage } from './helpers';
import { parseQuantity, priceSourceFor, suggestedTotal } from './pricePrefill';

// Dates are built in local time, like the form does, so these pass in any time zone
const now = new Date(2024, 5, 15, 14, 30);
const storage = (year: number, month: number, day: number) =>
	dateToStorage(new Date(year, month, day));

describe('priceSourceFor', () => {
	it("uses the current price for today's date", () => {
		expect(priceSourceFor(storage(2024, 5, 15), now)).toEqual({ kind: 'current' });
	});

	it('looks up an earlier day at 12:00 UTC', () => {
		expect(priceSourceFor(storage(2024, 2, 1), now)).toEqual({
			kind: 'historical',
			timestamp: Date.UTC(2024, 2, 1, 12) / 1000,
		});
	});

	it('looks up nothing for a future date', () => {
		expect(priceSourceFor(storage(2024, 5, 16), now)).toBeNull();
	});

	it('looks up nothing before 2010 or for an invalid date', () => {
		expect(priceSourceFor(storage(2009, 11, 31), now)).toBeNull();
		expect(priceSourceFor('', now)).toBeNull();
		expect(priceSourceFor('not a date', now)).toBeNull();
	});
});

describe('parseQuantity', () => {
	it('reads a positive number, with a dot or a comma', () => {
		expect(parseQuantity('0.5')).toBe(0.5);
		expect(parseQuantity('0,5')).toBe(0.5);
	});

	it('gives null for empty, zero or nonsense', () => {
		expect(parseQuantity('')).toBeNull();
		expect(parseQuantity('0')).toBeNull();
		expect(parseQuantity('abc')).toBeNull();
	});
});

describe('suggestedTotal', () => {
	it('multiplies and rounds to cents', () => {
		expect(suggestedTotal(2, 62345.123)).toBe(124690.25);
		expect(suggestedTotal(0.1, 0.33333)).toBe(0.03);
	});
});
