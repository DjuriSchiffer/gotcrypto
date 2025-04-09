import type { CurrencyQuote } from "api";
import type { FetchedCurrency, SelectedAsset } from "currency";

import { Card } from "flowbite-react";

import { useHistoricalPortfolioValues } from "../hooks/useHistoricalPortfolioValues";
import { currencyFormat } from "../utils/helpers";

export function HistoricalPortfolioValues({ currencyQuote = 'EUR', fetchedCurrencies, selectedAssets }: {
    currencyQuote?: keyof CurrencyQuote;
    fetchedCurrencies: Array<FetchedCurrency> | undefined;
    selectedAssets: Array<SelectedAsset>;
}) {
    const { isError, isLoading, yearlyTotals } = useHistoricalPortfolioValues(
        selectedAssets,
        fetchedCurrencies,
        currencyQuote
    );

    return (
        <Card>
            <div className="flex space-x-2">
                <div className="min-w-0 flex-1 flex items-center">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                        Year-End Portfolio Values (Jan 1st Prices)
                    </h5>
                </div>
            </div>
            {isLoading && <p>Loading historical values...</p>}
            {isError && <p>Error loading historical values</p>}
            {!isLoading && !isError && (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {yearlyTotals.map(yearly => (
                        <li className="py-3 sm:py-4" key={yearly.year}>
                            <div className="flex items-center space-x-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                        {yearly.year}: {currencyFormat(yearly.totalValue, currencyQuote)}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
};