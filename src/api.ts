import axios, { AxiosResponse } from 'axios';
import { GetCurrenciesResponse, HistoricalPriceResponse } from './types/api';

export const getCurrencies = async (): Promise<GetCurrenciesResponse> => {
  try {
    const response: AxiosResponse<GetCurrenciesResponse> = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOST}/api/coinmarketcap`
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      // If the API responds with an error message
      return error.response.data as GetCurrenciesResponse;
    } else {
      // For network or other unexpected errors
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};


export const getHistoricalPrices = async (
  id: number,
  startDate: string,
  endDate: string
): Promise<HistoricalPriceResponse> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOST}/api/coinmarketcap/historical`,
      {
        params: {
          id,
          start_date: startDate,
          end_date: endDate
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
};