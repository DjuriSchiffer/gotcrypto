import { useQueries } from '@tanstack/react-query';
import { CurrencyQuote } from 'api';
import { FetchedCurrency, SelectedAsset } from 'currency';
import { getQuoteByTimestamp } from '../api';
import { formatPrice } from './useCoinMarketCap';

export interface YearlyTotal {
    year: number;
    totalValue: number;
}


function extractPriceFromResponse(response: any): number | null {
    try {
        if (response &&
            response.data &&
            response.data.convertQuotes &&
            Array.isArray(response.data.convertQuotes) &&
            response.data.convertQuotes.length > 0 &&
            typeof response.data.convertQuotes[0].price === 'number') {

            return response.data.convertQuotes[0].price;
        }
        return null;
    } catch (error) {
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
    selectedCurrencies: SelectedAsset[] = [],
    fetchedCurrencies: FetchedCurrency[] | null = [],
    currencyQuote: keyof CurrencyQuote = 'EUR'
) => {
    const allTransactionYears = selectedCurrencies.flatMap(currency =>
        (currency.transactions || []).map(transaction => new Date(transaction.date).getFullYear())
    );

    const uniqueYears = [...new Set(allTransactionYears)].sort();
    const currentYear = new Date().getFullYear();

    if (uniqueYears.length > 0) {
        const earliestYear = Math.min(...uniqueYears);
        for (let year = earliestYear; year <= currentYear; year++) {
            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year);
            }
        }
        uniqueYears.sort();
    }

    const yearEndHoldings = uniqueYears.map(year => {
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);
        const endOfYearTimestamp = Math.floor(endOfYear.getTime() / 1000);

        const holdings = selectedCurrencies.map(currency => {
            if (!currency.transactions || !currency.cmc_id) {
                return null;
            }

            const transactionsUpToYearEnd = currency.transactions.filter(transaction =>
                new Date(transaction.date) <= endOfYear
            );

            let amount = 0;

            for (const transaction of transactionsUpToYearEnd) {
                if (transaction.excludeForTax) {
                    continue;
                }

                const transactionAmount = parseFloat(transaction.amount) || 0;
                const transactionType = transaction.type || 'unknown';

                if (transactionType === 'buy') {
                    amount += transactionAmount;
                }
                else if (transactionType === 'sell') {
                    amount -= transactionAmount;
                }
                else if (transactionType === 'transfer') {
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
                cmc_id: currency.cmc_id,
                name: currency.name,
                amount,
                timestamp: endOfYearTimestamp
            };
        }).filter(Boolean);

        return {
            year,
            holdings,
            timestamp: endOfYearTimestamp
        };
    });

    const convertId = currencyQuote === 'EUR' ? 2790 : 2781;

    const queryOptions = yearEndHoldings.flatMap(yearData =>
        yearData.holdings
            .filter(holding => holding !== null)
            .map(holding => ({
                queryKey: ['quoteByTimeStamp', holding.cmc_id, convertId, yearData.timestamp, currencyQuote],
                queryFn: async () => {
                    if (yearData.year === currentYear) {
                        const currentPrice = fetchedCurrencies?.find(c => c.cmc_id === holding.cmc_id)?.price || 0;
                        return {
                            year: yearData.year,
                            cmc_id: holding.cmc_id,
                            name: holding.name,
                            price: currentPrice,
                            amount: holding.amount
                        };
                    }

                    try {
                        const response = await getQuoteByTimestamp(holding.cmc_id, convertId, yearData.timestamp);

                        const price = extractPriceFromResponse(response);

                        if (price !== null) {
                            const formattedPrice = formatPrice(price);
                            return {
                                year: yearData.year,
                                cmc_id: holding.cmc_id,
                                name: holding.name,
                                price: formattedPrice,
                                amount: holding.amount
                            };
                        }

                        throw new Error('Could not extract price from response');
                    } catch (error) {
                        const currentPrice = fetchedCurrencies?.find(c => c.cmc_id === holding.cmc_id)?.price || 0;
                        return {
                            year: yearData.year,
                            cmc_id: holding.cmc_id,
                            name: holding.name,
                            price: currentPrice,
                            amount: holding.amount
                        };
                    }
                }
            }))
    );

    const results = useQueries({
        queries: queryOptions
    });

    const isLoading = results.some(result => result.isLoading);
    const isError = results.some(result => result.isError);

    let yearlyTotals: YearlyTotal[] = [];

    if (!isLoading && !isError) {
        const yearlyData = results.reduce((acc, result) => {
            if (!result.data) return acc;

            const { year, price, amount } = result.data;
            if (!acc[year]) acc[year] = 0;

            const assetValue = price * amount;
            acc[year] += assetValue;
            return acc;
        }, {} as Record<number, number>);

        yearlyTotals = Object.entries(yearlyData).map(([year, totalValue]) => ({
            year: parseInt(year),
            totalValue
        })).sort((a, b) => a.year - b.year);
    }

    return {
        yearlyTotals,
        isLoading,
        isError
    };
};