export type CurrencyQuote = {
  EUR: {
    price: number;
  };
};

export type CurrencyData = {
  slug: string;
  name: string;
  quote: CurrencyQuote;
  id: number;
};

export type GetCurrenciesResponse = {
  data?: Record<string, CurrencyData>;
  status: {
    error_code: number;
  };
  error?: string;
};
