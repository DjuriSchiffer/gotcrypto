import { useQueries } from '@tanstack/react-query';
import { CurrencyQuote } from 'api';
import { FetchedCurrency, SelectedAsset } from 'currency';
import { getGlobalTotals } from '../utils/totals';
import { GlobalTotals } from 'store';
import { getQuoteByTimestamp } from '../api';

/**
 * Represents the yearly portfolio value
 */
export interface YearlyTotal {
    year: number;
    totalValue: number;
}

/**
 * Extended GlobalTotals to include yearly values
 */
export interface ExtendedGlobalTotals extends GlobalTotals {
    yearlyTotals: YearlyTotal[];
}

/**
 * Helper function to format price values consistently
 */
function formatPrice(price: number) {
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
 * Custom function to extract price from the CMC historical quote response
 */
function extractPriceFromResponse(response: any): number | null {
    try {
        // Check if response has the expected structure
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
        console.warn('Error extracting price from response:', error);
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
    console.log(`Starting historical portfolio calculation with ${selectedCurrencies.length} currencies`);
    selectedCurrencies.forEach(currency => {
        console.log(`Asset: ${currency.name}, CMC ID: ${currency.cmc_id}, Transactions: ${currency.transactions?.length || 0}`);
    });

    // Find all unique years with transactions
    const allTransactionYears = selectedCurrencies.flatMap(currency =>
        (currency.transactions || []).map(transaction => new Date(transaction.date).getFullYear())
    );

    const uniqueYears = [...new Set(allTransactionYears)].sort();
    const currentYear = new Date().getFullYear();

    console.log(`Found transaction years: ${uniqueYears.join(', ')}`);

    // Add all years from earliest to current if they're missing
    if (uniqueYears.length > 0) {
        const earliestYear = Math.min(...uniqueYears);
        for (let year = earliestYear; year <= currentYear; year++) {
            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year);
            }
        }
        uniqueYears.sort();
    }

    console.log(`Processing years: ${uniqueYears.join(', ')}`);

    // Get year-end holdings for each asset
    const yearEndHoldings = uniqueYears.map(year => {
        console.log(`Calculating holdings for year ${year}`);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);
        const endOfYearTimestamp = Math.floor(endOfYear.getTime() / 1000);

        // Calculate holdings for each currency
        const holdings = selectedCurrencies.map(currency => {
            if (!currency.transactions || !currency.cmc_id) {
                console.log(`Skipping ${currency.name} - no transactions or CMC ID`);
                return null;
            }

            // Filter transactions up to the end of this year
            const transactionsUpToYearEnd = currency.transactions.filter(transaction =>
                new Date(transaction.date) <= endOfYear
            );

            console.log(`${currency.name} (${currency.cmc_id}): ${transactionsUpToYearEnd.length} transactions up to ${year}`);

            // Calculate net holdings
            let amount = 0;

            for (const transaction of transactionsUpToYearEnd) {
                // Skip excluded transactions
                if (transaction.excludeForTax) {
                    console.log(`Skipping excluded transaction: ${transaction.id}`);
                    continue;
                }

                const transactionAmount = parseFloat(transaction.amount) || 0;
                const transactionType = transaction.type || 'unknown';

                if (transactionType === 'buy') {
                    amount += transactionAmount;
                    console.log(`Buy: +${transactionAmount} (Total: ${amount})`);
                }
                else if (transactionType === 'sell') {
                    amount -= transactionAmount;
                    console.log(`Sell: -${transactionAmount} (Total: ${amount})`);
                }
                else if (transactionType === 'transfer') {
                    if (transaction.transferType === 'in') {
                        amount += transactionAmount;
                        console.log(`Transfer In: +${transactionAmount} (Total: ${amount})`);
                    } else if (transaction.transferType === 'out') {
                        amount -= transactionAmount;
                        console.log(`Transfer Out: -${transactionAmount} (Total: ${amount})`);
                    }
                }
            }

            console.log(`Final holdings for ${currency.name} at end of ${year}: ${amount}`);

            // Only include assets with positive holdings
            if (amount <= 0) {
                console.log(`Skipping ${currency.name} - no positive holdings at end of ${year}`);
                return null;
            }

            return {
                cmc_id: currency.cmc_id,
                name: currency.name,
                amount,
                timestamp: endOfYearTimestamp
            };
        }).filter(Boolean);

        console.log(`Year ${year}: ${holdings.length} assets with positive holdings`);
        holdings.forEach(h => console.log(`- ${h?.name}: ${h?.amount}`));

        return {
            year,
            holdings,
            timestamp: endOfYearTimestamp
        };
    });

    const convertId = currencyQuote === 'EUR' ? 2790 : 2781;
    console.log(`Using convert ID: ${convertId} for ${currencyQuote}`);

    const queryOptions = yearEndHoldings.flatMap(yearData => {
        console.log(`Creating queries for year ${yearData.year} with ${yearData.holdings.length} holdings`);

        return yearData.holdings
            .filter(holding => holding !== null)
            .map(holding => {
                console.log(`Creating query for ${holding.name} (ID: ${holding.cmc_id}) in ${yearData.year}`);

                return {
                    queryKey: ['quoteByTimeStamp', holding.cmc_id, convertId, yearData.timestamp, currencyQuote],
                    queryFn: async () => {
                        console.log(`Executing query for ${holding.name} (ID: ${holding.cmc_id}) in ${yearData.year}`);

                        // For the current year, use current prices
                        if (yearData.year === currentYear) {
                            const currentPrice = fetchedCurrencies?.find(c => c.cmc_id === holding.cmc_id)?.price || 0;
                            console.log(`Using current price for ${holding.name} (${yearData.year}): ${currentPrice}`);
                            return {
                                year: yearData.year,
                                cmc_id: holding.cmc_id,
                                name: holding.name,
                                price: currentPrice,
                                amount: holding.amount
                            };
                        }

                        try {
                            console.log(`Fetching historical price for ${holding.name} (ID: ${holding.cmc_id}) at ${yearData.timestamp}`);
                            // Fetch historical price
                            const response = await getQuoteByTimestamp(holding.cmc_id, convertId, yearData.timestamp);
                            console.log(`Got response for ${holding.name}`);

                            // Extract price using the custom function that handles the specific API response format
                            const price = extractPriceFromResponse(response);

                            if (price !== null) {
                                const formattedPrice = formatPrice(price);
                                console.log(`Historical price for ${holding.name} (${yearData.year}): ${formattedPrice}`);
                                return {
                                    year: yearData.year,
                                    cmc_id: holding.cmc_id,
                                    name: holding.name,
                                    price: formattedPrice,
                                    amount: holding.amount
                                };
                            }

                            // If we couldn't extract a price, fall back to current price
                            throw new Error('Could not extract price from response');
                        } catch (error) {
                            // Log for debugging but don't fail the query
                            console.warn(`Using current price for ${holding.name} (${yearData.year}) - ${error instanceof Error ? error.message : String(error)}`);

                            // Fallback to current price
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
                };
            });
    });

    console.log(`Created ${queryOptions.length} query options`);

    const results = useQueries({
        queries: queryOptions
    });

    console.log(`Got ${results.length} query results`);

    const isLoading = results.some(result => result.isLoading);
    const isError = results.some(result => result.isError);

    let yearlyTotals: YearlyTotal[] = [];

    if (!isLoading && !isError) {
        console.log('All queries completed successfully');

        const yearlyData = results.reduce((acc, result) => {
            if (!result.data) {
                console.log('Skipping result with no data');
                return acc;
            }

            const { year, price, amount, name, cmc_id } = result.data;
            if (!acc[year]) acc[year] = 0;

            const assetValue = price * amount;
            console.log(`${year}: ${name} (${cmc_id}) - ${amount} × ${price} = ${assetValue}`);

            acc[year] += assetValue;
            return acc;
        }, {} as Record<number, number>);

        yearlyTotals = Object.entries(yearlyData).map(([year, totalValue]) => ({
            year: parseInt(year),
            totalValue
        })).sort((a, b) => a.year - b.year);

        console.log('Final yearly totals:');
        yearlyTotals.forEach(yt => console.log(`${yt.year}: ${yt.totalValue}`));
    } else {
        console.log(`Queries still loading: ${isLoading}, Has errors: ${isError}`);
    }

    return {
        yearlyTotals,
        isLoading,
        isError
    };
};

