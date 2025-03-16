import { useQuery } from '@tanstack/react-query';
import { CryptoQuote, QuoteByTimestampResponse } from 'api';
import { getQuoteByTimestamp } from '../api';

function formatPrice(price: number) {
    if (typeof price !== 'number') return price;
    if (price === 0) return 0;

    const abs = Math.abs(price);

    if (abs >= 0.01) {
        return parseFloat(price.toFixed(2));
    }

    let significant = 0;
    let temp = abs;
    while (temp < 1) {
        temp *= 10;
        significant++;
    }

    return parseFloat(price.toFixed(significant + 1));
}

const transformQuoteData = (data: QuoteByTimestampResponse): CryptoQuote | null => {
    if (!data.data || !data.data.quotes || data.data.quotes.length === 0) {
        return null;
    }

    const { data: cryptoData } = data;
    const quoteData = cryptoData.quotes[0].quote;

    return {
        name: cryptoData.name,
        symbol: cryptoData.symbol,
        price: formatPrice(quoteData.price),
        volume24h: quoteData.volume24h,
        marketCap: quoteData.marketCap,
        percentChange24h: quoteData.percentChange24h,
        timestamp: cryptoData.quotes[0].timestamp
    };
};

interface UseCryptoQuoteOptions {
    coinId?: number;
    convertId?: number;
    timestamp?: number;
    enabled?: boolean;
}

const useCryptoQuote = ({
    coinId = 1, // Bitcoin by default
    convertId = 2790, // USD by default
    timestamp = Math.floor(Date.now() / 1000),
    enabled = true
}: UseCryptoQuoteOptions = {}) => {
    return useQuery({
        queryKey: ['quoteByTimeStamp', coinId, convertId, timestamp],
        queryFn: async () => {
            const response = await getQuoteByTimestamp(coinId, convertId, timestamp);

            if (response.status.error_code === 0) {
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
                throw new Error(response.status.error_message || 'An error occurred');
            }
        },
        retry: false
    });
};

export default useCryptoQuote;