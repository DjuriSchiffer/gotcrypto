import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAppState } from '../hooks/useAppState';
import { percentageFormat, currencyFormat } from '../utils/calculateHelpers';
import { Card, Spinner, Button, Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import Charts from '../components/ChartsDashboard';
import { SelectedCurrency } from 'currency';
import { GlobalTotals } from 'store';
import DashboardCard from '../components/DashboardCard';
import { useStorage } from '../hooks/useStorage';

const createCryptoMap = (
  currencies: SelectedCurrency[]
): Map<number, SelectedCurrency> => {
  return new Map(currencies.map((currency) => [currency.cmc_id, currency]));
};

type DashboardProps = {};

const Dashboard: React.FC<DashboardProps> = () => {
  const { fetchedCurrencies, globalTotals } = useAppState();
  const { selectedCurrencies, loading: loadingStorage } = useStorage();

  const cryptoMap = useMemo(
    () => createCryptoMap(selectedCurrencies),
    [selectedCurrencies]
  );

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {fetchedCurrencies.map((fetchedCurrency) => {
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
