import type { CurrencyQuote } from 'api';

import { Button, Spinner } from 'flowbite-react';
import { FaCheck } from 'react-icons/fa';

import { useAppState } from '../hooks/useAppState';
import { usePriceOnDate } from '../hooks/usePriceOnDate';
import { currencyFormat, dateForDisplay } from '../utils/helpers';
import { parseQuantity, priceSourceFor, suggestedTotal } from '../utils/pricePrefill';

/** The coin the form is for, so its price can be looked up */
export type PriceLookupCoin = {
	cmcId: number;
	/** Today's price from the price list; null if there is none */
	currentPrice: null | number;
	name: string;
};

type PriceSuggestionProps = {
	/** The quantity as typed in the form */
	amount: string;
	coin: PriceLookupCoin;
	currencyQuote: keyof CurrencyQuote;
	/** The date as the form stores it */
	date: string;
	/** The total currently in the price field */
	enteredTotal: string;
	onUse: (total: number) => void;
};

const boxClass =
	'mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300';

/**
 * Under the price field: what the coins were worth on the chosen date, with a button to use it.
 * It never changes the field by itself. Nothing is looked up until a quantity is entered.
 */
function PriceSuggestion({
	amount,
	coin,
	currencyQuote,
	date,
	enteredTotal,
	onUse,
}: PriceSuggestionProps) {
	const { dateLocale } = useAppState();
	const quantity = parseQuantity(amount);
	const lookup = usePriceOnDate({
		cmcId: coin.cmcId,
		currencyQuote,
		currentPrice: coin.currentPrice,
		date,
		enabled: quantity !== null,
	});

	const isToday = priceSourceFor(date)?.kind === 'current';
	const dateLabel = isToday ? 'today' : dateForDisplay(date, dateLocale);
	const money = (value: number) => currencyFormat(value, currencyQuote);

	if (lookup.status === 'idle' || quantity === null) return null;

	if (lookup.status === 'loading') {
		return (
			<div className={boxClass} role="status">
				<span className="flex items-center gap-2">
					<Spinner aria-hidden size="xs" />
					Looking up the price on {dateLabel}…
				</span>
			</div>
		);
	}

	if (lookup.status === 'unavailable') {
		return (
			<p className="mt-2 text-sm text-gray-500 dark:text-gray-400" role="status">
				No {coin.name} price found for {dateLabel}. Enter it yourself.
			</p>
		);
	}

	const total = suggestedTotal(quantity, lookup.price);
	const isUsed = Math.abs(parseFloat(enteredTotal.replace(',', '.')) - total) < 0.005;

	return (
		<div className={boxClass} role="status">
			<span>
				{isToday ? 'Now' : `On ${dateLabel}`}, 1 {coin.name} {isToday ? 'is' : 'was'}{' '}
				<strong className="font-medium text-gray-900 dark:text-white">{money(lookup.price)}</strong>
			</span>
			{isUsed ? (
				<span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
					<FaCheck aria-hidden className="h-3 w-3" />
					Used
				</span>
			) : (
				<Button
					color="light"
					onClick={() => {
						onUse(total);
					}}
					size="xs"
				>
					Use {money(total)}
				</Button>
			)}
		</div>
	);
}

export default PriceSuggestion;
