import type { CurrencyQuote } from 'api';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getQuoteByTimestamp } from '../api';
import { CONVERT_IDS, priceSourceFor } from '../utils/pricePrefill';
import { extractYearEndPrice } from '../utils/yearEnd';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export type PriceOnDate =
	| { price: number; status: 'found' }
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'unavailable' };

type Options = {
	cmcId: number;
	/** Today's price from the price list, used when the date is today; null if there is none */
	currentPrice: null | number;
	currencyQuote: keyof CurrencyQuote;
	/** The date as the form stores it */
	date: string;
	/** Only look anything up once this is true (e.g. a quantity has been entered) */
	enabled: boolean;
};

/**
 * The price of one coin on a transaction date. Today's price comes from the price list;
 * an earlier date is looked up once per coin and hour, and remembered for the session.
 */
export const usePriceOnDate = ({
	cmcId,
	currentPrice,
	currencyQuote,
	date,
	enabled,
}: Options): PriceOnDate => {
	const convertId = CONVERT_IDS[currencyQuote];
	const source = useMemo(() => priceSourceFor(date), [date]);
	const timestamp = source?.kind === 'historical' ? source.timestamp : null;

	const query = useQuery({
		enabled: enabled && timestamp !== null,
		gcTime: ONE_WEEK,
		queryFn: async () => {
			if (timestamp === null) throw new Error('No date to look up');
			const price = extractYearEndPrice(await getQuoteByTimestamp(cmcId, convertId, timestamp));
			if (price === null) throw new Error(`No price for coin ${String(cmcId)} at ${String(timestamp)}`);
			return price;
		},
		// Per hour: the server rounds down to the hour, so every time within it gives the same price
		queryKey: ['priceOnDate', cmcId, convertId, timestamp === null ? null : Math.floor(timestamp / 3600)],
		retry: false,
		// A past price doesn't change
		staleTime: Infinity,
	});

	if (!enabled || source === null) return { status: 'idle' };

	if (source.kind === 'current') {
		return currentPrice === null ? { status: 'unavailable' } : { price: currentPrice, status: 'found' };
	}

	if (query.data !== undefined) return { price: query.data, status: 'found' };
	if (query.isError) return { status: 'unavailable' };
	return { status: 'loading' };
};
