import React, { useMemo } from 'react';
import { Card, Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import { useStorage } from '../hooks/useStorage';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Charts from '../components/Charts';
import { useAppState } from '../hooks/useAppState';
import { createCryptoMap, currencyFormat, percentageFormat } from '../utils/helpers';
import { getGlobalTotals } from '../utils/totals';
import classNames from 'classnames';


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

  return (
    <LoadingErrorWrapper
      storageIsLoading={storageIsLoading}
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
    >
      <Page>
        <div className="grid gap-4 mb-4 w-full mt-14 lg:mt-auto">
          {globalTotals && (
            <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 mb-4'>
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
            </div>
          )}
          <div className='grid grid-cols-1 gap-4 mb-4'>
            <Card>
              <Charts assetMap={assetMap} fetchedCurrencies={fetchedCurrencies} selectedAssets={selectedCurrencies} id="amount" />
              <Charts assetMap={assetMap} fetchedCurrencies={fetchedCurrencies} selectedAssets={selectedCurrencies} id="invested" />
            </Card>
          </div>
        </div>
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Graphs;