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
