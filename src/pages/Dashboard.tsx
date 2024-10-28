import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useAppState } from '../hooks/useAppState';
import { percentageFormat, currencyFormat } from '../utils/calculateHelpers';
import { Card, Spinner, Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import Charts from '../components/ChartsDashboard';
import { SelectedCurrency } from 'currency';
import DashboardCard from '../components/DashboardCard';
import { useStorage } from '../hooks/useStorage';
import SearchInput from '../components/SearchInput';
import { MultiValue } from 'react-select';
import { getGlobalTotals } from '../utils/totals';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import { ChangeQuote } from '../components/ChangeQuote';

const createCryptoMap = (
  currencies: SelectedCurrency[]
): Map<number, SelectedCurrency> => {
  return new Map(currencies.map((currency) => [currency.cmc_id, currency]));
};

type DashboardProps = {};
interface OptionType {
  value: number;
  label: string;
  image: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<OptionType>
  >([]);
  const { sortMethod, currencyQuote } = useAppState();
  const { selectedCurrencies, loading: storageIsLoading } = useStorage();
  const {
    data: fetchedCurrencies,
    isLoading: fetchedCurrenciesIsLoading,
    isError: fetchedCurrenciesIsError,
  } = useCoinMarketCap(currencyQuote);

  const cryptoMap = useMemo(
    () => createCryptoMap(selectedCurrencies),
    [selectedCurrencies]
  );

  const filteredFetchedCurrencies = useMemo(() => {
    if (
      fetchedCurrencies === undefined ||
      fetchedCurrencies === null ||
      selectedOptions.length === 0
    ) {
      return fetchedCurrencies;
    }

    const selectedIds = selectedOptions.map((option) => option.value);

    return fetchedCurrencies.filter((currency) =>
      selectedIds.includes(currency.cmc_id)
    );
  }, [fetchedCurrencies, selectedOptions]);

  const sortedFetchedCurrencies = useMemo(() => {
    if (
      filteredFetchedCurrencies === undefined ||
      filteredFetchedCurrencies === null
    ) {
      return [];
    }
    let sorted = [...filteredFetchedCurrencies];

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
  }, [filteredFetchedCurrencies, sortMethod, cryptoMap, fetchedCurrencies]);

  const globalTotals = useMemo(() => {
    return getGlobalTotals(selectedCurrencies, fetchedCurrencies);
  }, [fetchedCurrencies, selectedCurrencies]);

  const handleSelectChange = useCallback((selected: MultiValue<OptionType>) => {
    setSelectedOptions(selected);
  }, []);

  return (
    <LoadingErrorWrapper
      storageIsLoading={storageIsLoading}
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
    >
      <Page>
        <div className="grid gap-4 mb-4 w-full">
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 '>
            {globalTotals && (
              <div className="text-white">
                Current ballance
                <Tooltip content="Total Value">
                  <div className="text-4xl">
                    {currencyFormat(globalTotals.totalValue, currencyQuote)}
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
            <div className='ml-auto'><ChangeQuote /></div>
            <div className=''>
              <SearchInput
                options={fetchedCurrencies}
                selectedOptions={selectedOptions}
                onChange={handleSelectChange}
                placeholder="Search and select currencies..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sortedFetchedCurrencies.map((fetchedCurrency) => {
              const isSelected =
                cryptoMap.has(fetchedCurrency.cmc_id) &&
                cryptoMap.get(fetchedCurrency.cmc_id)!?.assets.length > 0;
              return (
                <DashboardCard
                  fetchedCurrency={fetchedCurrency}
                  key={fetchedCurrency.cmc_id}
                  cryptoMap={cryptoMap}
                  isSelected={isSelected}
                  currencyQuote={currencyQuote}
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
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Dashboard;
