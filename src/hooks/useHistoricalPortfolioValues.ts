import type { CurrencyQuote } from 'api';
import type { SelectedAsset } from 'currency';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { YearEndValue } from '../utils/yearEnd';

import { getQuoteByTimestamp } from '../api';
import {
	combineYearEndValues,
	extractYearEndPrice,
	getYearEndHoldings,
	priceKey,
	yearEndTimestamp,
} from '../utils/yearEnd';

const CONVERT_IDS: Record<keyof CurrencyQuote, number> = { EUR: 2790, USD: 2781 };
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

/**
 * The portfolio's value at the end of every completed year, at 1 January prices.
 *
 * A price that can't be loaded is never replaced by another one (like today's price):
 * the year is returned with the affected assets in `missingAssets`, so the page can say so.
 */
export const useHistoricalPortfolioValues = (
	selectedCurrencies: Array<SelectedAsset> = [],
	currencyQuote: keyof CurrencyQuote = 'EUR'
) => {
	const convertId = CONVERT_IDS[currencyQuote];

	const years = useMemo(
		() => getYearEndHoldings(selectedCurrencies, new Date().getFullYear()),
		[selectedCurrencies]
	);

	// One request per coin and year
	const requests = useMemo(
		() =>
			years.flatMap(({ holdings, year }) =>
				holdings.map((holding) => ({ cmcId: holding.cmcId, year }))
			),
		[years]
	);

	const results = useQueries({
		queries: requests.map(({ cmcId, year }) => ({
			gcTime: ONE_WEEK,
			queryFn: async () => {
				const price = extractYearEndPrice(
					await getQuoteByTimestamp(cmcId, convertId, yearEndTimestamp(year))
				);
				if (price === null) {
					throw new Error(`No year-end price for coin ${String(cmcId)} in ${String(year)}`);
				}
				return price;
			},
			queryKey: ['yearEndPrice', cmcId, convertId, year],
			retry: 1,
			// A past year's price never changes
			staleTime: Infinity,
		})),
	});

	const isLoading = results.some((result) => result.isPending);

	const prices = new Map<string, number>();
	results.forEach((result, index) => {
		if (result.data !== undefined) {
			const { cmcId, year } = requests[index];
			prices.set(priceKey(cmcId, year), result.data);
		}
	});

	const yearlyTotals: Array<YearEndValue> = isLoading ? [] : combineYearEndValues(years, prices);

	return {
		hasMissingPrices: yearlyTotals.some((year) => year.missingAssets.length > 0),
		isLoading,
		yearlyTotals,
	};
};
