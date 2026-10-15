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

/** A coin as the dashboard and detail page show it. `price` is null when there is no current price. */
export type DisplayCoin = Omit<FetchedCurrency, 'price'> & { price: null | number };

/** A coin the user added that isn't in the price list (any more). */
const unpricedCoin = (asset: SelectedAsset): DisplayCoin => ({
	cmc_id: asset.cmc_id,
	cmc_rank: null,
	name: asset.name || `Coin #${String(asset.cmc_id)}`,
	price: null,
	slug: asset.slug,
});

/** The detail page of a coin. Assets saved by the old asset picker have no slug, so those go by id. */
export const coinPath = (coin: Pick<FetchedCurrency, 'cmc_id' | 'slug'>): string =>
	`/${coin.slug || String(coin.cmc_id)}`;

/**
 * The coins shown on the dashboard: every coin the user added, sorted by rank.
 * A coin missing from the price list is still shown, with `price: null`, so holdings never
 * disappear. With 'has_selected', assets that have transactions come first.
 */
export const getDashboardAssets = (
	fetchedCurrencies: Array<FetchedCurrency> | undefined,
	selectedCurrencies: Array<SelectedAsset>,
	sortMethod: SortMethod
): Array<DisplayCoin> => {
	if (!fetchedCurrencies) return [];

	const prices = new Map(fetchedCurrencies.map((currency) => [currency.cmc_id, currency]));
	const withTransactions = new Set(
		selectedCurrencies.filter((asset) => asset.transactions.length > 0).map((asset) => asset.cmc_id)
	);

	const seen = new Set<number>();
	const coins: Array<DisplayCoin> = [];
	for (const asset of selectedCurrencies) {
		if (seen.has(asset.cmc_id)) continue;
		seen.add(asset.cmc_id);
		coins.push(prices.get(asset.cmc_id) ?? unpricedCoin(asset));
	}

	return coins.sort((a, b) => {
		if (sortMethod === 'has_selected') {
			const difference =
				Number(withTransactions.has(b.cmc_id)) - Number(withTransactions.has(a.cmc_id));
			if (difference !== 0) return difference;
		}
		return compareRank(a, b);
	});
};

/**
 * The coin for a detail page address: a slug, or an id for assets saved without one.
 * Coins in the price list come with their price; the user's own coins are found even without one.
 */
export const findDetailCoin = (
	param: string | undefined,
	fetchedCurrencies: Array<FetchedCurrency> | undefined,
	selectedCurrencies: Array<SelectedAsset>
): DisplayCoin | undefined => {
	if (!param) return undefined;

	const priced = fetchedCurrencies?.find((currency) => currency.slug === param);
	if (priced) return priced;

	const asset = selectedCurrencies.find(
		(item) => (item.slug !== '' && item.slug === param) || String(item.cmc_id) === param
	);
	if (!asset) return undefined;

	return (
		fetchedCurrencies?.find((currency) => currency.cmc_id === asset.cmc_id) ?? unpricedCoin(asset)
	);
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
