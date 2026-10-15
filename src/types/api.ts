export type CurrencyQuote = {
	EUR: {
		price: number;
	};
	USD: {
		price: number;
	};
};

export type CurrencyData = {
	cmc_rank: null | number;
	id: number;
	name: string;
	quote: CurrencyQuote;
	slug: string;
};

export type GetCurrenciesResponse = {
	data?: Array<CurrencyData>;
	error?: string;
	status: {
		error_code: number;
		error_message: null | string;
		/** True when the server couldn't refresh and sent the last prices it had */
		stale?: boolean;
		/** When the prices were fetched from CoinMarketCap (ISO date) */
		timestamp?: string;
	};
};

export type QuoteByTimestampResponse = {
	data: {
		id: number;
		name: string;
		quotes: Array<{
			quote: {
				marketCap: number;
				percentChange24h: number;
				price: number;
				volume24h: number;
			};
			timestamp: string;
		}>;
		symbol: string;
	};
	error?: string;
	status: {
		credit_count: number;
		elapsed: number;
		error_code: number;
		error_message: null | string;
		timestamp: string;
	};
};

export type CryptoQuote = {
	marketCap: number;
	name: string;
	percentChange24h: number;
	price: number;
	symbol: string;
	timestamp: string;
	volume24h: number;
};
