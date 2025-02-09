import React, { useMemo } from 'react';
import { Card, Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import { useStorage } from '../hooks/useStorage';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Charts from '../components/Charts';
import { useAppState } from '../hooks/useAppState';
import { createCryptoMap, currencyFormat, percentageFormat } from '../utils/helpers';
import { getGlobalTotals, getTotalPercentageDifference } from '../utils/totals';
import classNames from 'classnames';
import { FetchedCurrency } from 'currency';
import { getImage } from '../utils/images';


const Graphs: React.FC = () => {
  const { currencyQuote } = useAppState();
  const {
    data: fetchedCurrencies,
    isLoading: fetchedCurrenciesIsLoading,
    isError: fetchedCurrenciesIsError,
  } = useCoinMarketCap(currencyQuote);
  const {
    selectedCurrencies,
    loading: storageIsLoading,
  } = useStorage();


  const assetMap = useMemo(
    () => createCryptoMap(selectedCurrencies),
    [selectedCurrencies]
  );

  const globalTotals = useMemo(() => {
    return getGlobalTotals(selectedCurrencies, fetchedCurrencies);
  }, [fetchedCurrencies, selectedCurrencies]);

  const bestPerformingAsset = useMemo(() => {
    const assetsWithPerformance = selectedCurrencies.map(selectedCurrency => {
      const currentCurrency = fetchedCurrencies?.find(
        (fetchedCurrency) => fetchedCurrency.cmc_id === selectedCurrency.cmc_id
      );
      const currentPrice = currentCurrency?.price ?? 0;
      const currentCMCID = currentCurrency?.cmc_id ?? 0;
      const percentageDifference = getTotalPercentageDifference(
        assetMap,
        currentCMCID,
        currentPrice
      );

      return {
        currentCurrency: currentCurrency,
        percentageDifference
      };
    });

    return assetsWithPerformance.reduce((best, current) => {
      if (!best || (current.percentageDifference > best.percentageDifference)) {
        return current;
      }
      return best;
    }, null as { currentCurrency: FetchedCurrency | undefined, percentageDifference: number } | null);

  }, [selectedCurrencies, fetchedCurrencies]);

  return (
    <LoadingErrorWrapper
      storageIsLoading={storageIsLoading}
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
    >
      <Page>
        <div className="grid gap-4 mb-4 w-full mt-14 lg:mt-auto">
          {globalTotals && (
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
              <div className="text-white">
                Total value
                <Tooltip content="Total Value">
                  <div className="text-4xl">
                    {currencyFormat(globalTotals.totalValue, currencyQuote)}
                  </div>
                </Tooltip>
              </div>
              <div className="text-white">
                Total invested
                <Tooltip content="Total Costs">
                  <div className="text-4xl">
                    {currencyFormat(globalTotals.totalPurchasePrice, currencyQuote)}
                  </div>
                </Tooltip>
              </div>
              <div className="text-white">
                Total Profit/loss
                <Tooltip content="((Total Value - Total Costs) / Total Costs) × 100">
                  <div
                    className={classNames('text-xl', {
                      'text-blue-500':
                        globalTotals.totalPercentageDifference > 0,
                      'text-red-500':
                        globalTotals.totalPercentageDifference < 0,
                    })}
                  >
                    <div className="text-4xl">
                      {percentageFormat(globalTotals.totalPercentageDifference)}
                    </div>
                  </div>
                </Tooltip>
              </div>
              <div className="text-white">
                Best performing asset
                <Tooltip content="Based by total profit per asset">
                  <div className="text-4xl">
                    <div className="flex items-center">
                      <img
                        width={32}
                        height={32}
                        src={getImage(bestPerformingAsset?.currentCurrency?.cmc_id)}
                        alt={`${bestPerformingAsset?.currentCurrency?.name} icon`}
                      />
                      <div className="pl-2"> {bestPerformingAsset?.currentCurrency?.name}</div>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
            <Card>
              <Charts assetMap={assetMap} fetchedCurrencies={fetchedCurrencies} selectedAssets={selectedCurrencies} id="amount" />
            </Card>
            <Card>
              <Charts assetMap={assetMap} fetchedCurrencies={fetchedCurrencies} selectedAssets={selectedCurrencies} id="invested" />
            </Card>
          </div>
        </div>
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Graphs;