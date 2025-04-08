import type { CryptoQuote, QuoteByTimestampResponse } from 'api';

import { useQuery } from '@tanstack/react-query';

import { getQuoteByTimestamp } from '../api';
import { formatPrice } from './useCoinMarketCap';

export const transformQuoteData = (data: QuoteByTimestampResponse): CryptoQuote | null => {
    if (data.data.quotes.length === 0) {
        return null;
    }

    const { data: cryptoData } = data;
    const quoteData = cryptoData.quotes[0].quote;

    return {
        marketCap: quoteData.marketCap,
        name: cryptoData.name,
        percentChange24h: quoteData.percentChange24h,
        price: formatPrice(quoteData.price),
        symbol: cryptoData.symbol,
        timestamp: cryptoData.quotes[0].timestamp,
        volume24h: quoteData.volume24h
    };
};

type UseQuoteByTimeStampOptions = {
    coinId?: number;
    convertId?: number;
    enabled?: boolean;
    timestamp?: number;
}

const useQuoteBytTimeStamp = ({
    coinId = 1, // Bitcoin by default
    convertId = 2790, // USD by default
    timestamp = Math.floor(Date.now() / 1000),
}: UseQuoteByTimeStampOptions = {}) => {
    return useQuery({
        queryFn: async () => {
            const response = await getQuoteByTimestamp(coinId, convertId, timestamp);


            if (response.status.error_code == 0) {
                if (response.error) {
                    throw new Error(response.status.error_message || response.error);
                } else {
                    const transformedData = transformQuoteData(response);
                    if (!transformedData) {
                        throw new Error('No quote data available');
                    }
                    return transformedData;
                }
            } else {
                console.log('error', response)
                throw new Error(response.status.error_message || 'An error occurred');
            }
        },
        queryKey: ['quoteByTimeStamp', coinId, convertId, timestamp],
        retry: false
    });
};

export default useQuoteBytTimeStamp;