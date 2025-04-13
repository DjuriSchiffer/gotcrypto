import type { CurrencyData, CurrencyQuote, GetCurrenciesResponse } from 'api';

import { useQuery } from '@tanstack/react-query';

import type { FetchedCurrency } from '../types/currency';

import { getCurrencies } from '../api';

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

/**
 * Transforms the API response into an array of FetchedCurrency objects.
 * @param data - The data object from the API response.
 * @returns An array of FetchedCurrency objects.
 */
const transformCurrencies = (
	data: Record<string, CurrencyData>,
	currencyQuote: keyof CurrencyQuote
): Array<FetchedCurrency> => {
	return Object.values(data)
		.map((asset) => ({
			cmc_id: asset.id,
			cmc_rank: asset.cmc_rank ?? null,
			name: asset.name,
			price: formatPrice(asset.quote[currencyQuote].price),
			slug: asset.slug,
		}))
		.sort((a, b) => {
			if (a.cmc_rank !== null && b.cmc_rank !== null) {
				return a.cmc_rank - b.cmc_rank;
			} else if (a.cmc_rank !== null && b.cmc_rank === null) {
				return -1;
			} else if (a.cmc_rank === null && b.cmc_rank !== null) {
				return 1;
			} else {
				return 0;
			}
		});
};

/**
 * Custom hook to fetch and manage currencies using React Query.
 * @returns The result of the useQuery hook.
 */
const useCoinMarketCap = (currencyQuote: keyof CurrencyQuote = 'EUR') => {
	const { data, error, isError, isLoading } = useQuery({
		queryFn: async () => {
			const data: GetCurrenciesResponse = await getCurrencies();

			if (data.status.error_code === 0) {
				if (data.error) {
					throw new Error(data.status.error_message);
				} else if (data.data) {
					return transformCurrencies(data.data, currencyQuote);
				}
			} else {
				throw new Error(data.status.error_message);
			}

			throw new Error('Unknown error occurred while fetching currencies');
		},
		queryKey: ['fetchedCurrencies', currencyQuote],
	});

	return {
		data,
		error,
		isError,
		isLoading,
	};
};

export default useCoinMarketCap;
