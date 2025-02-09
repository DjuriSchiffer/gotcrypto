import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useAppState } from '../hooks/useAppState';
import { percentageFormat, currencyFormat, createCryptoMap } from '../utils/helpers';
import { Tooltip } from 'flowbite-react';
import Page from '../components/Page';
import { SelectedAsset } from 'currency';
import DashboardCard from '../components/DashboardCard';
import { useStorage } from '../hooks/useStorage';
import SearchInput from '../components/SearchInput';
import { MultiValue } from 'react-select';
import { getGlobalTotals } from '../utils/totals';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import { ChangeQuote } from '../components/ChangeQuote';
import { ChangeLayout } from '../components/ChangeLayout';
import Table from '../components/Table';
import DashboardTableRow from '../components/DashboardTableRow';

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
  const { sortMethod, currencyQuote, dashboardLayout } = useAppState();
  const { selectedCurrencies, loading: storageIsLoading } = useStorage();
  const {
    data: fetchedCurrencies,
    isLoading: fetchedCurrenciesIsLoading,
    isError: fetchedCurrenciesIsError,
  } = useCoinMarketCap(currencyQuote);

  const assetMap = useMemo(
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
        const aSelected = assetMap.has(a.cmc_id) ? 0 : 1;
        const bSelected = assetMap.has(b.cmc_id) ? 0 : 1;

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
  }, [sortMethod, assetMap, filteredFetchedCurrencies]);

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
          <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 mb-4'>
            {globalTotals && (
              <div className="text-white">
                Current ballance
                <Tooltip content="Total Value">
                  <div className="text-4xl">
                    {currencyFormat(globalTotals.totalValue, currencyQuote)}
                  </div>
                </Tooltip>
                <Tooltip content="((Total Value - Total Costs) / Total Costs) × 100">
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
          <div className='flex row flex-wrap gap-4'>
            <ChangeLayout />
            <ChangeQuote />
            <div className='ml-auto w-full md:w-6/12 lg:w-4/12'>
              <SearchInput
                options={fetchedCurrencies}
                selectedOptions={selectedOptions}
                onChange={handleSelectChange}
                placeholder="Search and select assets..."
              />
            </div>
          </div>
          {dashboardLayout === 'Grid' &&
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFetchedCurrencies.map((fetchedCurrency) => {
                const isSelected =
                  assetMap.has(fetchedCurrency.cmc_id) &&
                  assetMap.get(fetchedCurrency.cmc_id)!?.transactions.length > 0;
                return (
                  <DashboardCard
                    fetchedCurrency={fetchedCurrency}
                    key={fetchedCurrency.cmc_id}
                    assetMap={assetMap}
                    isSelected={isSelected}
                    currencyQuote={currencyQuote}
                  />
                );
              })}
            </div>
          }
          {dashboardLayout === 'Table' &&
            <Table type="dashboard">
              {sortedFetchedCurrencies.map((fetchedCurrency) => {
                const isSelected =
                  assetMap.has(fetchedCurrency.cmc_id) &&
                  assetMap.get(fetchedCurrency.cmc_id)!?.transactions.length > 0;
                return (
                  <DashboardTableRow
                    fetchedCurrency={fetchedCurrency}
                    key={fetchedCurrency.cmc_id}
                    assetMap={assetMap}
                    isSelected={isSelected}
                    currencyQuote={currencyQuote}
                  />)
              })}
            </Table>}

        </div>
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Dashboard;
