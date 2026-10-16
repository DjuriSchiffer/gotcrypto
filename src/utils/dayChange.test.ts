import { describe, expect, it } from 'vitest';

import type { FetchedCurrency } from '../types/currency';

import { asset, buy, sell } from '../test/factories';
import { getPortfolioDayChange, signedPercentage } from './dayChange';

const coin = (cmcId: number, price: number, change24h?: null | number): FetchedCurrency => ({
	change24h,
	cmc_id: cmcId,
	cmc_rank: cmcId,
	name: `Coin ${String(cmcId)}`,
	price,
	slug: `coin-${String(cmcId)}`,
});

describe('getPortfolioDayChange', () => {
	it("compares the holdings' value now with 24 hours ago", () => {
		// 1 coin, now 110 after +10%: it was worth 100 a day ago
		const result = getPortfolioDayChange([asset(1, [buy(1, 50)])], [coin(1, 110, 10)]);

		expect(result).toEqual({ change: 10, percentage: 10 });
	});

	it('weighs coins by their value', () => {
		// Coin 1: 100 → 110 (+10). Coin 2: 300 → 270 (-30). Together 400 → 380: -20, -5%
		const result = getPortfolioDayChange(
			[asset(1, [buy(1, 50)]), asset(2, [buy(3, 50)])],
			[coin(1, 110, 10), coin(2, 90, -10)]
		);

		expect(result).toEqual({ change: -20, percentage: -5 });
	});

	it("leaves out coins that aren't held, have no price, or have no 24h change", () => {
		const result = getPortfolioDayChange(
			[
				asset(1, [buy(1, 50)]),
				asset(2, [buy(1, 50), sell(1, 60)]),
				asset(3, [buy(1, 50)]),
				asset(4, [buy(1, 50)]),
			],
			[coin(1, 110, 10), coin(2, 500, 50), coin(3, 100, null), coin(4, 100)]
		);

		expect(result).toEqual({ change: 10, percentage: 10 });
	});

	it('gives null when nothing can be compared', () => {
		expect(getPortfolioDayChange([asset(1, [buy(1, 50)])], [coin(1, 100, null)])).toBeNull();
		expect(getPortfolioDayChange([asset(1, [buy(1, 50)])], undefined)).toBeNull();
		expect(getPortfolioDayChange([], [coin(1, 100, 5)])).toBeNull();
	});
});

describe('signedPercentage', () => {
	it('adds a plus for gains only', () => {
		expect(signedPercentage(2.1)).toBe('+2.10%');
		expect(signedPercentage(-2.1)).toBe('-2.10%');
		expect(signedPercentage(0)).toBe('0.00%');
	});
});
