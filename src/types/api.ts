export type CurrencyQuote = {
  EUR: {
    price: number;
  };
  USD: {
    price: number;
  };
};

export type CurrencyData = {
  slug: string;
  name: string;
  quote: CurrencyQuote;
  id: number;
  cmc_rank: number | null;
};

export type GetCurrenciesResponse = {
  data?: Record<string, CurrencyData>;
  status: {
    error_code: number;
    error_message: string;
  };
  error?: string;
};


export interface QuoteByTimestampResponse {
  data: {
    quotes: Array<{
      quote: {
        price: number;
        volume24h: number;
        marketCap: number;
        percentChange24h: number;
      };
      timestamp: string;
    }>;
    id: number;
    name: string;
    symbol: string;
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  error?: string;
}

export interface CryptoQuote {
  name: string;
  symbol: string;
  price: number;
  volume24h: number;
  marketCap: number;
  percentChange24h: number;
  timestamp: string;
}
