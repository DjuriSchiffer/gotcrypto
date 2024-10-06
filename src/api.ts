import axios, { AxiosResponse } from 'axios';
import { GetCurrenciesResponse } from './types/api';

export const getCurrencies = async (): Promise<GetCurrenciesResponse> => {
  try {
    const response: AxiosResponse<GetCurrenciesResponse> = await axios.get(
      `${import.meta.env.VITE_REACT_APP_HOST}/wp-json/prices/v2/post/`
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as GetCurrenciesResponse;
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};