import { useQuery } from '@tanstack/react-query';
import { getCurrencies } from '../api';
import { FetchedCurrency } from '../types/currency';
import { CurrencyData, GetCurrenciesResponse } from 'api';

/**
 * Transforms the API response into an array of FetchedCurrency objects.
 * @param data - The data object from the API response.
 * @returns An array of FetchedCurrency objects.
 */
const transformCurrencies = (
  data: Record<string, CurrencyData>
): FetchedCurrency[] => {
  return Object.values(data)
    .map((currency) => ({
      name: currency.name,
      price: parseFloat(currency.quote.USD.price.toFixed(2)),
      slug: currency.slug,
      cmc_id: currency.id,
      cmc_rank: currency.cmc_rank || null,
    }))
    .sort((a, b) => {
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
};

/**
 * Custom hook to fetch and manage currencies using React Query.
 * @returns The result of the useQuery hook.
 */
const useCoinMarketCap = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['fetchedCurrencies'],
    queryFn: async () => {
      const data: GetCurrenciesResponse = await getCurrencies();

      console.log('data', data);
      console.log('isLoading', isLoading);
      console.log('isError', isError);
      console.log('error', error);

      if (data.status.error_code === 0) {
        if (data.error) {
          throw new Error(data.status.error_message);
        } else if (data.data) {
          return transformCurrencies(data.data);
        }
      } else {
        throw new Error(data.status.error_message);
      }

      throw new Error('Unknown error occurred while fetching currencies');
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useCoinMarketCap;
