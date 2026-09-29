import { describe, expect, it } from 'vitest';

import type { FetchedCurrency } from '../types/currency';

import { asset, buy } from '../test/factories';
import {
	applyAssetChanges,
	compareRank,
	createAsset,
	filterCoins,
	getDashboardAssets,
} from './assets';

const coin = (cmcId: number, rank: null | number = cmcId): FetchedCurrency => ({
	cmc_id: cmcId,
	cmc_rank: rank,
	name: `Coin ${cmcId}`,
	price: 1,
	slug: `coin-${cmcId}`,
});

describe('compareRank', () => {
	it('sorts by rank, with unranked coins last', () => {
		const sorted = [coin(1, null), coin(2, 5), coin(3, 1)].sort(compareRank);

		expect(sorted.map((item) => item.cmc_id)).toEqual([3, 2, 1]);
	});
});

describe('getDashboardAssets', () => {
	const fetched = [coin(1), coin(2), coin(3), coin(4)];

	it('returns nothing while prices are loading', () => {
		expect(getDashboardAssets(undefined, [asset(1)], 'cmc_rank')).toEqual([]);
	});

	it('only shows coins the user added, by rank', () => {
		const result = getDashboardAssets(fetched, [asset(3), asset(1)], 'cmc_rank');

		expect(result.map((item) => item.cmc_id)).toEqual([1, 3]);
	});

	it('puts assets with transactions first when sorting by selected status', () => {
		const selected = [asset(1), asset(2), asset(3, [buy(1, 100)])];
		const result = getDashboardAssets(fetched, selected, 'has_selected');

		expect(result.map((item) => item.cmc_id)).toEqual([3, 1, 2]);
	});

	it('does not change the fetched list', () => {
		const original = [coin(2), coin(1)];
		getDashboardAssets(original, [asset(1), asset(2)], 'cmc_rank');

		expect(original.map((item) => item.cmc_id)).toEqual([2, 1]);
	});
});

describe('createAsset', () => {
	it('creates a complete asset, including the slug', () => {
		expect(createAsset(coin(7), 2)).toMatchObject({
			cmc_id: 7,
			index: 2,
			name: 'Coin 7',
			slug: 'coin-7',
			transactions: [],
		});
	});
});

describe('applyAssetChanges', () => {
	it('adds and removes in the same save', () => {
		const result = applyAssetChanges([asset(1), asset(2)], [coin(3)], [2]);

		expect(result.map((item) => item.cmc_id)).toEqual([1, 3]);
	});

	it('never removes an asset with transactions', () => {
		const result = applyAssetChanges([asset(1, [buy(1, 100)])], [], [1]);

		expect(result.map((item) => item.cmc_id)).toEqual([1]);
	});

	it('does not add a coin twice', () => {
		const result = applyAssetChanges([asset(1)], [coin(1), coin(2)], []);

		expect(result.map((item) => item.cmc_id)).toEqual([1, 2]);
	});

	it('gives added assets a complete shape', () => {
		const [added] = applyAssetChanges([], [coin(5)], []);

		expect(added.slug).toBe('coin-5');
		expect(added.totals.totalAmount).toBe(0);
	});
});

describe('filterCoins', () => {
	const coins = [
		{ name: 'Bitcoin', slug: 'bitcoin' },
		{ name: 'Bitcoin Cash', slug: 'bitcoin-cash' },
		{ name: 'Ethereum', slug: 'ethereum' },
	];

	it('matches names regardless of case', () => {
		expect(filterCoins(coins, 'BITCOIN').map((coin) => coin.name)).toEqual([
			'Bitcoin',
			'Bitcoin Cash',
		]);
	});

	it('matches slugs', () => {
		expect(filterCoins(coins, 'bitcoin-c').map((coin) => coin.name)).toEqual(['Bitcoin Cash']);
	});

	it('returns everything for an empty or blank query', () => {
		expect(filterCoins(coins, '   ')).toHaveLength(3);
	});
});
