import { FetchedCurrency, SelectedAsset } from "currency";
import { useHistoricalPortfolioValues } from "../hooks/useHistoricalPortfolioValues";
import { CurrencyQuote } from "api";

/**
 * Component to display historical portfolio values
 */
export const HistoricalPortfolioValues: React.FC<{
    selectedAssets: SelectedAsset[];
    fetchedCurrencies: FetchedCurrency[] | undefined;
    currencyQuote?: keyof CurrencyQuote;
}> = ({ selectedAssets, fetchedCurrencies, currencyQuote = 'EUR' }) => {
    const { yearlyTotals, isLoading, isError } = useHistoricalPortfolioValues(
        selectedAssets,
        fetchedCurrencies,
        currencyQuote
    );

    // Use the result in your component...
    return (
        <div>
            {isLoading && <p>Loading historical values...</p>}
            {isError && <p>Error loading historical values</p>}
            {!isLoading && !isError && (
                <div>
                    <h3>Yearly Portfolio Values</h3>
                    <ul>
                        {yearlyTotals.map(yearly => (
                            <li key={yearly.year}>
                                {yearly.year}: ${yearly.totalValue.toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};