import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import { useQueries } from '@tanstack/react-query';

import { getQuoteByTimestamp } from '../api';
import { formatPrice } from './useCoinMarketCap';

export type YearlyTotal = {
	totalValue: number;
	year: number;
};

type ApiResponse = {
	data: {
		convertQuotes: Array<{
			name: string;
			price: number;
		}>;
		id: number;
		timestamp: string;
	};
	status: {
		credit_count: number;
		elapsed: string;
		error_code: string;
		error_message: string;
		timestamp: string;
	};
};

function extractPriceFromResponse(response: ApiResponse): null | number {
	try {
		if (
			Array.isArray(response.data.convertQuotes) &&
			response.data.convertQuotes.length > 0 &&
			typeof response.data.convertQuotes[0].price === 'number'
		) {
			return response.data.convertQuotes[0].price;
		}
		return null;
	} catch (_error) {
		return null;
	}
}

/**
 * Hook to fetch historical portfolio values
 * @param selectedCurrencies - Array of selected currencies with transactions
 * @param fetchedCurrencies - Array of fetched currencies with current prices
 * @param currencyQuote - The currency to use for quotes (EUR or USD)
 */
export const useHistoricalPortfolioValues = (
	selectedCurrencies: Array<SelectedAsset> = [],
	fetchedCurrencies: Array<FetchedCurrency> | null = [],
	currencyQuote: keyof CurrencyQuote = 'EUR'
) => {
	const allTransactionYears = selectedCurrencies.flatMap((currency) =>
		currency.transactions.map((transaction) => new Date(transaction.date).getFullYear())
	);

	const uniqueYears = [...new Set(allTransactionYears)].sort();
	const currentYear = new Date().getFullYear();

	if (uniqueYears.length > 0) {
		const earliestYear = Math.min(...uniqueYears);
		const lastCompletedYear = currentYear - 1;

		for (let year = earliestYear; year <= lastCompletedYear; year++) {
			if (!uniqueYears.includes(year)) {
				uniqueYears.push(year);
			}
		}
		uniqueYears.sort();

		const currentYearIndex = uniqueYears.indexOf(currentYear);
		if (currentYearIndex !== -1) {
			uniqueYears.splice(currentYearIndex, 1);
		}
	}

	const yearEndHoldings = uniqueYears.map((year) => {
		const endOfYear = new Date(year, 11, 31, 23, 59, 59);

		const nextYear = year + 1;
		const januaryFirstNextYear = new Date(nextYear, 0, 1, 0, 0, 0);
		const priceTimestamp = Math.floor(januaryFirstNextYear.getTime() / 1000);

		const holdings = selectedCurrencies
			.map((currency) => {
				if (!currency.cmc_id) {
					return null;
				}

				const transactionsUpToYearEnd = currency.transactions.filter(
					(transaction) => new Date(transaction.date) <= endOfYear
				);

				let amount = 0;

				for (const transaction of transactionsUpToYearEnd) {
					if (transaction.excludeForTax) {
						continue;
					}

					const transactionAmount = parseFloat(transaction.amount) || 0;
					const transactionType = transaction.type;

					if (transactionType === 'buy') {
						amount += transactionAmount;
					} else if (transactionType === 'sell') {
						amount -= transactionAmount;
					} else {
						if (transaction.transferType === 'in') {
							amount += transactionAmount;
						} else if (transaction.transferType === 'out') {
							amount -= transactionAmount;
						}
					}
				}

				if (amount <= 0) {
					return null;
				}

				return {
					amount,
					cmc_id: currency.cmc_id,
					name: currency.name,
					timestamp: priceTimestamp,
				};
			})
			.filter(Boolean);

		return {
			holdings,
			timestamp: priceTimestamp,
			year,
		};
	});

	const convertId = currencyQuote === 'EUR' ? 2790 : 2781;

	const queryOptions = yearEndHoldings.flatMap((yearData) =>
		yearData.holdings
			.filter((holding) => holding !== null)
			.map((holding) => ({
				queryFn: async () => {
					try {
						const response = (await getQuoteByTimestamp(
							holding.cmc_id,
							convertId,
							yearData.timestamp
						)) as unknown as ApiResponse;

						const price = extractPriceFromResponse(response);

						if (price !== null) {
							const formattedPrice = formatPrice(price);
							return {
								amount: holding.amount,
								cmc_id: holding.cmc_id,
								name: holding.name,
								price: formattedPrice,
								year: yearData.year,
							};
						}

						throw new Error('Could not extract price from response');
					} catch (_error) {
						const foundCurrency = fetchedCurrencies?.find((c) => c.cmc_id === holding.cmc_id);
						const currentPrice = foundCurrency?.price ?? 0;
						return {
							amount: holding.amount,
							cmc_id: holding.cmc_id,
							name: holding.name,
							price: currentPrice,
							year: yearData.year,
						};
					}
				},
				queryKey: [
					'quoteByTimeStamp',
					holding.cmc_id,
					convertId,
					yearData.timestamp,
					currencyQuote,
				],
			}))
	);

	const results = useQueries({
		combine: (results) => {
			return results.map((result) => ({
				...result,
				cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
				refetchOnMount: false,
				refetchOnReconnect: false,
				refetchOnWindowFocus: false,
				staleTime: 1000 * 60 * 60 * 24, // 24 hours
			}));
		},
		queries: queryOptions,
	});

	const isLoading = results.some((result) => result.isLoading);
	const isError = results.some((result) => result.isError);

	let yearlyTotals: Array<YearlyTotal> = [];

	if (!isLoading && !isError) {
		const yearlyData = results.reduce<Record<number, number>>((acc, result) => {
			if (!result.data) return acc;

			const { amount, price, year } = result.data;
			if (!acc[year]) acc[year] = 0;

			const assetValue = price * amount;
			acc[year] += assetValue;
			return acc;
		}, {});

		yearlyTotals = Object.entries(yearlyData)
			.map(([year, totalValue]) => ({
				totalValue,
				year: parseInt(year),
			}))
			.sort((a, b) => a.year - b.year);
	}

	return {
		isError,
		isLoading,
		yearlyTotals,
	};
};
