import type { AxiosError, AxiosResponse } from 'axios';

import axios from 'axios';

import type { GetCurrenciesResponse, QuoteByTimestampResponse } from './types/api';

export const getCurrencies = async (): Promise<GetCurrenciesResponse> => {
	try {
		const response: AxiosResponse<GetCurrenciesResponse> = await axios.get(
			`${import.meta.env.VITE_REACT_APP_HOST}/api/coinmarketcap`
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<GetCurrenciesResponse>;
			if (axiosError.response?.data) {
				return axiosError.response.data;
			}
			throw new Error(axiosError.message || 'API request failed');
		}
		throw new Error('An unexpected error occurred');
	}
};

export const getQuoteByTimestamp = async (
	coinId = 1,
	convertId = 2790, // USD by default
	timestamp: number = Math.floor(Date.now() / 1000)
): Promise<QuoteByTimestampResponse> => {
	try {
		const response: AxiosResponse<QuoteByTimestampResponse> = await axios.get(
			`${import.meta.env.VITE_REACT_APP_HOST}/api/quote-by-timestamp`,
			{
				params: {
					coinId,
					convertId,
					timestamp,
				},
			}
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<QuoteByTimestampResponse>;
			if (axiosError.response?.data) {
				return axiosError.response.data;
			}
			throw new Error(axiosError.message || 'API request failed');
		}
		throw new Error('An unexpected error occurred');
	}
};
