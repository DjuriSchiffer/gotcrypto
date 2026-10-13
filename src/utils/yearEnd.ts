import type { SelectedAsset, Transaction } from '../types/currency';

/** Holdings below this are rounding residue, not a position. */
const DUST = 1e-10;

export type YearEndHolding = {
	amount: number;
	cmcId: number;
	name: string;
};

export type YearEndHoldings = {
	holdings: Array<YearEndHolding>;
	year: number;
};

export type YearEndValue = {
	/** Assets whose price for this year couldn't be loaded; the total leaves them out */
	missingAssets: Array<string>;
	totalValue: number;
	year: number;
};

/**
 * The moment a year's holdings are valued: 1 January of the next year, 00:00 local time.
 * For a Dutch user that's midnight in Amsterdam, the Box 3 reference moment.
 */
export const yearEndTimestamp = (year: number): number =>
	Math.floor(new Date(year + 1, 0, 1).getTime() / 1000);

const signedAmount = (transaction: Transaction): number => {
	const amount = parseFloat(transaction.amount) || 0;
	if (transaction.type === 'buy') return amount;
	if (transaction.type === 'sell') return -amount;
	if (transaction.transferType === 'in') return amount;
	if (transaction.transferType === 'out') return -amount;
	return 0;
};

/**
 * What was held at the end of every completed year, from the first transaction until last year.
 * Transactions marked "exclude for tax" are left out. Years without holdings are included
 * with an empty list, so they show as a value of zero instead of disappearing.
 */
export const getYearEndHoldings = (
	assets: Array<SelectedAsset>,
	currentYear: number
): Array<YearEndHoldings> => {
	const counted = assets.map((asset) => ({
		asset,
		transactions: asset.transactions.filter((transaction) => !transaction.excludeForTax),
	}));

	const years = counted.flatMap(({ transactions }) =>
		transactions.map((transaction) => new Date(transaction.date).getUTCFullYear())
	);
	if (years.length === 0) return [];

	const result: Array<YearEndHoldings> = [];

	for (let year = Math.min(...years); year < currentYear; year++) {
		const holdings = counted
			.map(({ asset, transactions }) => ({
				amount: transactions
					.filter((transaction) => new Date(transaction.date).getUTCFullYear() <= year)
					.reduce((sum, transaction) => sum + signedAmount(transaction), 0),
				cmcId: asset.cmc_id,
				name: asset.name,
			}))
			.filter((holding) => holding.amount > DUST);

		result.push({ holdings, year });
	}

	return result;
};

/** The key a year's price for one coin is stored under. */
export const priceKey = (cmcId: number, year: number) => `${cmcId}-${year}`;

/**
 * Turns holdings and the prices that could be loaded into a value per year.
 * A missing price is never replaced by another price: the asset is listed as missing instead.
 */
export const combineYearEndValues = (
	years: Array<YearEndHoldings>,
	prices: Map<string, number>
): Array<YearEndValue> =>
	years.map(({ holdings, year }) => {
		let totalValue = 0;
		const missingAssets: Array<string> = [];

		for (const holding of holdings) {
			const price = prices.get(priceKey(holding.cmcId, year));
			if (price === undefined) {
				missingAssets.push(holding.name);
			} else {
				totalValue += holding.amount * price;
			}
		}

		return { missingAssets, totalValue, year };
	});

/**
 * Reads the price from a quote-by-timestamp response, or null if it isn't there,
 * for example because the API returned an error body.
 */
export const extractYearEndPrice = (response: unknown): null | number => {
	const data = (response as null | { data?: unknown })?.data as
		| null
		| undefined
		| {
				convertQuotes?: Array<{ price?: unknown }>;
				quotes?: Array<{ quote?: { price?: unknown } }>;
		  };

	const price = data?.convertQuotes?.[0]?.price ?? data?.quotes?.[0]?.quote?.price;
	return typeof price === 'number' && Number.isFinite(price) && price > 0 ? price : null;
};
