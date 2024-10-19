import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useAppState } from '../hooks/useAppState';
import { percentageFormat, currencyFormat } from '../utils/calculateHelpers';
import { Card, Spinner, Button, Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import Charts from '../components/ChartsDashboard';
import { FetchedCurrency, SelectedCurrency } from 'currency';
import { GlobalTotals } from 'store';
import DashboardCard from '../components/DashboardCard';
import { useStorage } from '../hooks/useStorage';
import SortSelector from '../components/SortSelector';

const createCryptoMap = (
  currencies: SelectedCurrency[]
): Map<number, SelectedCurrency> => {
  return new Map(currencies.map((currency) => [currency.cmc_id, currency]));
};

type DashboardProps = {};

const Dashboard: React.FC<DashboardProps> = () => {
  const { fetchedCurrencies, globalTotals, sortMethod } = useAppState();
  const {
    selectedCurrencies,
    loading: loadingStorage,
    setSortMethod,
  } = useStorage();

  const cryptoMap = useMemo(
    () => createCryptoMap(selectedCurrencies),
    [selectedCurrencies]
  );

  const sortedFetchedCurrencies = useMemo(() => {
    if (fetchedCurrencies === null) return [];

    let sorted = [...fetchedCurrencies];

    if (sortMethod === 'cmc_rank') {
      sorted.sort((a, b) => {
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
    } else if (sortMethod === 'has_selected') {
      sorted.sort((a, b) => {
        const aSelected = cryptoMap.has(a.cmc_id) ? 0 : 1;
        const bSelected = cryptoMap.has(b.cmc_id) ? 0 : 1;

        if (aSelected !== bSelected) {
          return aSelected - bSelected;
        }

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
    }

    return sorted;
  }, [fetchedCurrencies, sortMethod, cryptoMap]);

  if (loadingStorage) {
    return (
      <Page>
        <div className="text-white flex items-center">
          <Spinner color="success" aria-label="Loading saved data" />
          <span className="ml-2">Loading saved data...</span>
        </div>
      </Page>
    );
  }

  if (!fetchedCurrencies) {
    return (
      <Page>
        <div className="text-white flex items-center">
          <Spinner
            color="success"
            aria-label="Fetching data from Coinmarketcap"
          />
          <span className="ml-2">Fetching data from Coinmarketcap...</span>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <>
        <div className="grid gap-4 mb-4">
          <Card>
            <div className="flex flex-row items-center">
              {globalTotals && (
                <div className="text-white ">
                  <Tooltip content="Total Value">
                    <div className="text-4xl">
                      {currencyFormat(globalTotals.totalValue)}
                    </div>
                  </Tooltip>
                  <Tooltip content="( Total Costs / Total Value * 100 ) - 100">
                    <div
                      className={classNames('text-xl', {
                        'text-blue-500':
                          globalTotals.totalPercentageDifference > 0,
                        'text-red-500':
                          globalTotals.totalPercentageDifference < 0,
                      })}
                    >
                      {percentageFormat(globalTotals.totalPercentageDifference)}
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>
          </Card>
          <div className="mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <SortSelector sortMethod={sortMethod} onChange={setSortMethod} />
              {/* <CurrencySearch ... /> */}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sortedFetchedCurrencies.map((fetchedCurrency) => {
              const isSelected = cryptoMap.has(fetchedCurrency.cmc_id);
              return (
                <DashboardCard
                  fetchedCurrency={fetchedCurrency}
                  key={fetchedCurrency.cmc_id}
                  cryptoMap={cryptoMap}
                  isSelected={isSelected}
                />
              );
            })}
          </div>
        </div>
        {/* {selectedCurrencies.some((e) => e.assets.length > 0) && (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              <Card>
                <Charts data={selectedCurrencies} id="amount" />
              </Card>
              <Card>
                <Charts data={selectedCurrencies} id="invested" />
              </Card>
            </div>
          )} */}
      </>
    </Page>
  );
};

export default Dashboard;
