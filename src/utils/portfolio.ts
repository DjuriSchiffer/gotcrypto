import type { FetchedCurrency, SelectedAsset } from '../types/currency';
import type { AssetSummary } from './totals';

import { getAssetSummary } from './totals';

const round = (value: number): number => Number(value.toFixed(2)) || 0;

export type AssetBreakdown = AssetSummary & {
	/** Share of the total portfolio value, in percent */
	allocation: number;
	cmcId: number;
	name: string;
	price: number;
	slug: string;
	/** Realized + unrealized profit */
	totalProfit: number;
	/** Total profit relative to everything ever spent on buys, in percent */
	totalProfitPercentage: number;
};

/**
 * One row per asset with transactions, sorted by current value (largest first).
 * Closed positions are included: they have no value but can have realized profit.
 */
export const getPortfolioBreakdown = (
	assets: Array<SelectedAsset>,
	fetchedCurrencies: Array<FetchedCurrency> | null | undefined
): Array<AssetBreakdown> => {
	const fetchedById = new Map((fetchedCurrencies ?? []).map((item) => [item.cmc_id, item]));

	const rows = assets
		.filter((asset) => asset.transactions.length > 0)
		.map((asset) => {
			const fetched = fetchedById.get(asset.cmc_id);
			const price = fetched?.price ?? 0;
			const summary = getAssetSummary(asset, price);
			const totalProfit = round(summary.realizedProfit + summary.unrealizedProfit);
			const spent = asset.totals.totalPurchasePrice;

			return {
				...summary,
				allocation: 0,
				cmcId: asset.cmc_id,
				name: asset.name || fetched?.name || '',
				price,
				slug: asset.slug || fetched?.slug || '',
				totalProfit,
				totalProfitPercentage: spent > 0 ? round((totalProfit / spent) * 100) : 0,
			};
		});

	const totalValue = rows.reduce((sum, row) => sum + row.value, 0);

	return rows
		.map((row) => ({
			...row,
			allocation: totalValue > 0 ? round((row.value / totalValue) * 100) : 0,
		}))
		.sort((a, b) => b.value - a.value);
};

export type Highlights = {
	best?: AssetBreakdown;
	largest?: AssetBreakdown;
	worst?: AssetBreakdown;
};

/** Best and worst by total profit in money (realized + unrealized), and the largest position. */
export const getHighlights = (rows: Array<AssetBreakdown>): Highlights => {
	if (rows.length === 0) return {};

	const byProfit = [...rows].sort((a, b) => b.totalProfit - a.totalProfit);

	return {
		best: byProfit[0],
		largest: rows.find((row) => row.value > 0),
		worst: byProfit.length > 1 ? byProfit.at(-1) : undefined,
	};
};

export type AllocationSlice = { label: string; value: number };

export const OTHER_LABEL = 'Other';

/**
 * Turns rows into chart slices. Keeps the largest `maxSlices - 1` positions and
 * combines the rest into "Other", so a donut chart stays readable.
 */
export const getAllocationSlices = (
	rows: Array<AssetBreakdown>,
	maxSlices = 6
): Array<AllocationSlice> => {
	const slices = rows
		.filter((row) => row.value > 0)
		.map((row) => ({ label: row.name, value: row.value }));

	if (slices.length <= maxSlices) return slices;

	const kept = slices.slice(0, maxSlices - 1);
	const rest = slices.slice(maxSlices - 1).reduce((sum, slice) => sum + slice.value, 0);

	return [...kept, { label: OTHER_LABEL, value: rest }];
};

export type YearEndRow = {
	/** Percentage change compared to the previous year, or null for the first year */
	change: null | number;
	totalValue: number;
	year: number;
};

/** Adds the change compared to the previous year, oldest year first. */
export const withYearOverYear = (
	totals: Array<{ totalValue: number; year: number }>
): Array<YearEndRow> =>
	[...totals]
		.sort((a, b) => a.year - b.year)
		.map((item, index, sorted) => {
			const previous = index > 0 ? sorted[index - 1] : undefined;
			const change =
				previous && previous.totalValue > 0
					? round(((item.totalValue - previous.totalValue) / previous.totalValue) * 100)
					: null;

			return { ...item, change };
		});
