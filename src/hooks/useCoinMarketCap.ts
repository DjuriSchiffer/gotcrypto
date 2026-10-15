import type { CurrencyData, CurrencyQuote, GetCurrenciesResponse } from 'api';

import { useQuery } from '@tanstack/react-query';

import type { FetchedCurrency } from '../types/currency';

import { getCurrencies } from '../api';
import { compareRank } from '../utils/assets';

export function formatPrice(price: number) {
	if (typeof price !== 'number') return price;
	if (price === 0) return 0;

	const abs = Math.abs(price);

	if (abs >= 0.01) {
		return parseFloat(price.toFixed(2));
	}

	let significant = 0;
	let temp = abs;
	while (temp < 1) {
		temp *= 10;
		significant++;
	}

	return parseFloat(price.toFixed(significant + 1));
}

/** Turns the API's coins into FetchedCurrency objects, sorted by rank. */
export const transformCurrencies = (
	data: Array<CurrencyData>,
	currencyQuote: keyof CurrencyQuote
): Array<FetchedCurrency> =>
	data
		.map((asset) => ({
			cmc_id: asset.id,
			cmc_rank: asset.cmc_rank ?? null,
			name: asset.name,
			price: formatPrice(asset.quote[currencyQuote].price),
			slug: asset.slug,
		}))
		.sort(compareRank);

export type PriceList = {
	coins: Array<FetchedCurrency>;
	/** True when the server couldn't refresh and sent the last prices it had */
	stale: boolean;
	/** When the prices were fetched from CoinMarketCap, if the server says */
	updatedAt: Date | null;
};

/** Checks the API response and turns it into a price list; throws on an error response. */
export const toPriceList = (
	response: GetCurrenciesResponse,
	currencyQuote: keyof CurrencyQuote
): PriceList => {
	if (response.status.error_code !== 0 || response.error || !response.data) {
		throw new Error(
			response.status.error_message ?? response.error ?? 'Could not load prices from CoinMarketCap'
		);
	}

	const updatedAt = response.status.timestamp ? new Date(response.status.timestamp) : null;

	return {
		coins: transformCurrencies(response.data, currencyQuote),
		stale: response.status.stale === true,
		updatedAt: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : null,
	};
};

/**
 * The current prices, via React Query.
 * `data` is the list of coins; `stale` and `updatedAt` say how fresh those prices are.
 */
const useCoinMarketCap = (
	currencyQuote: keyof CurrencyQuote = 'EUR',
	{ enabled = true }: { enabled?: boolean } = {}
) => {
	const { data, error, isError, isLoading, isPending } = useQuery({
		enabled,
		queryFn: async () => toPriceList(await getCurrencies(), currencyQuote),
		queryKey: ['fetchedCurrencies', currencyQuote],
	});

	return {
		data: data?.coins,
		error,
		isError,
		isLoading,
		isPending,
		stale: data?.stale ?? false,
		updatedAt: data?.updatedAt ?? null,
	};
};

export default useCoinMarketCap;
