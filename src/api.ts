import axios, { AxiosResponse } from 'axios';
import { GetCurrenciesResponse, QuoteByTimestampResponse } from './types/api';

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

export const getQuoteByTimestamp = async (
  coinId: number = 1,
  convertId: number = 2790, // USD by default
  timestamp: number = Math.floor(Date.now() / 1000)
): Promise<QuoteByTimestampResponse> => {
  try {
    const response: AxiosResponse<QuoteByTimestampResponse> = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOST}/api/quote-by-timestamp`,
      {
        params: {
          coinId,
          convertId,
          timestamp
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as QuoteByTimestampResponse;
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

