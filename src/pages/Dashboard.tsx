import type { MultiValue } from 'react-select';

import classNames from 'classnames';
import { Tooltip } from 'flowbite-react';
import { useCallback, useMemo, useState } from 'react';

import { ChangeLayout } from '../components/ChangeLayout';
import DashboardCard from '../components/DashboardCard';
import DashboardTableRow from '../components/DashboardTableRow';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import SearchInput from '../components/SearchInput';
import Table from '../components/Table';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { createCryptoMap, currencyFormat, percentageFormat } from '../utils/helpers';
import { getGlobalTotals } from '../utils/totals';

type OptionType = {
  image: string;
  label: string;
  value: number;
}

function Dashboard() {
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<OptionType>
  >([]);
  const { currencyQuote, dashboardLayout, sortMethod } = useAppState();
  const { loading: storageIsLoading, selectedCurrencies } = useStorage();
  const {
    data: fetchedCurrencies,
    isError: fetchedCurrenciesIsError,
    isLoading: fetchedCurrenciesIsLoading,
  } = useCoinMarketCap(currencyQuote);

  const assetMap = useMemo(
    () => createCryptoMap(selectedCurrencies),
    [selectedCurrencies]
  );

  const filteredFetchedCurrencies = useMemo(() => {
    if (selectedOptions.length === 0) {
      return fetchedCurrencies;
    }

    const selectedIds = selectedOptions.map((option) => option.value);

    return fetchedCurrencies?.filter((currency) =>
      selectedIds.includes(currency.cmc_id)
    );
  }, [fetchedCurrencies, selectedOptions]);

  const sortedFetchedCurrencies = useMemo(() => {
    if (!filteredFetchedCurrencies) {
      return [];
    }
    const sorted = [...filteredFetchedCurrencies];

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
    } else {
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
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
      storageIsLoading={storageIsLoading}
    >
      <Page>
        <div className="grid gap-4 mb-4 w-full">
          <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 mb-4'>
            <div className="text-white">
              Current ballance
              <Tooltip content="Total Value">
                <div className="text-4xl">
                  {currencyFormat(globalTotals.totalValue, currencyQuote)}
                </div>
              </Tooltip>
              <Tooltip content="((Total Value - Total Invested) / Total Invested) × 100">
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
          </div>
          <div className='flex row flex-wrap gap-4'>
            <ChangeLayout />
            <div className='ml-auto w-full md:w-6/12 lg:w-4/12'>
              <SearchInput
                onChange={handleSelectChange}
                options={fetchedCurrencies}
                placeholder="Search and select assets..."
                selectedOptions={selectedOptions}
              />
            </div>
          </div>
          {dashboardLayout === 'Grid' &&
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFetchedCurrencies.map((fetchedCurrency) => {
                const asset = assetMap.get(fetchedCurrency.cmc_id);
                const isSelected =
                  assetMap.has(fetchedCurrency.cmc_id) &&
                  asset !== undefined &&
                  asset.transactions.length > 0;
                return (
                  <DashboardCard
                    assetMap={assetMap}
                    currencyQuote={currencyQuote}
                    fetchedCurrency={fetchedCurrency}
                    isSelected={isSelected}
                    key={fetchedCurrency.cmc_id}
                  />
                );
              })}
            </div>
          }
          {dashboardLayout === 'Table' &&
            <Table type="dashboard">
              {sortedFetchedCurrencies.map((fetchedCurrency) => {
                const asset = assetMap.get(fetchedCurrency.cmc_id);
                const isSelected =
                  assetMap.has(fetchedCurrency.cmc_id) &&
                  asset !== undefined &&
                  asset.transactions.length > 0;
                return (
                  <DashboardTableRow
                    assetMap={assetMap}
                    currencyQuote={currencyQuote}
                    fetchedCurrency={fetchedCurrency}
                    isSelected={isSelected}
                    key={fetchedCurrency.cmc_id}
                  />)
              })}
            </Table>}
        </div>
      </Page>
    </LoadingErrorWrapper>
  );
}

export default Dashboard;