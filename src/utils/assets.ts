import type { SortMethod } from 'store';

import type { FetchedCurrency, SelectedAsset } from '../types/currency';

import totals from './totals';

type CoinReference = Pick<FetchedCurrency, 'cmc_id' | 'name' | 'slug'>;

/** Ranked coins first, lowest rank first; coins without a rank last. */
export const compareRank = (
	a: Pick<FetchedCurrency, 'cmc_rank'>,
	b: Pick<FetchedCurrency, 'cmc_rank'>
): number => {
	if (a.cmc_rank !== null && b.cmc_rank !== null) return a.cmc_rank - b.cmc_rank;
	if (a.cmc_rank !== null) return -1;
	if (b.cmc_rank !== null) return 1;
	return 0;
};

/**
 * The coins shown on the dashboard: only the ones the user added, sorted by rank.
 * With 'has_selected', assets that have transactions come first.
 */
export const getDashboardAssets = (
	fetchedCurrencies: Array<FetchedCurrency> | undefined,
	selectedCurrencies: Array<SelectedAsset>,
	sortMethod: SortMethod
): Array<FetchedCurrency> => {
	if (!fetchedCurrencies) return [];

	const selectedIds = new Set(selectedCurrencies.map((asset) => asset.cmc_id));
	const withTransactions = new Set(
		selectedCurrencies.filter((asset) => asset.transactions.length > 0).map((asset) => asset.cmc_id)
	);

	return fetchedCurrencies
		.filter((currency) => selectedIds.has(currency.cmc_id))
		.sort((a, b) => {
			if (sortMethod === 'has_selected') {
				const difference =
					Number(withTransactions.has(b.cmc_id)) - Number(withTransactions.has(a.cmc_id));
				if (difference !== 0) return difference;
			}
			return compareRank(a, b);
		});
};

/** A new, empty asset for a coin from CoinMarketCap, with every field filled in. */
export const createAsset = (currency: CoinReference, index: number): SelectedAsset => ({
	cmc_id: currency.cmc_id,
	index,
	name: currency.name,
	slug: currency.slug,
	totals: totals([]),
	transactions: [],
});

/**
 * Applies additions and removals in one go, so neither overwrites the other.
 * Assets with transactions are never removed, even if asked to.
 */
export const applyAssetChanges = (
	current: Array<SelectedAsset>,
	toAdd: Array<CoinReference>,
	removeIds: Array<number>
): Array<SelectedAsset> => {
	const remove = new Set(removeIds);
	const kept = current.filter(
		(asset) => !remove.has(asset.cmc_id) || asset.transactions.length > 0
	);

	const existingIds = new Set(kept.map((asset) => asset.cmc_id));
	const added = toAdd
		.filter((currency) => !existingIds.has(currency.cmc_id))
		.map((currency, offset) => createAsset(currency, kept.length + offset));

	return [...kept, ...added];
};

/** Coins whose name or slug contains the query, ignoring case. An empty query matches all. */
export const filterCoins = <T extends Pick<FetchedCurrency, 'name' | 'slug'>>(
	coins: Array<T>,
	query: string
): Array<T> => {
	const search = query.trim().toLowerCase();
	if (!search) return coins;

	return coins.filter(
		(coin) => coin.name.toLowerCase().includes(search) || coin.slug.includes(search)
	);
};
