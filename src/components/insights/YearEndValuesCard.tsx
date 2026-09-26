import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import {
	Alert,
	Card,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
	Tooltip,
} from 'flowbite-react';
import { useMemo } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import { useHistoricalPortfolioValues } from '../../hooks/useHistoricalPortfolioValues';
import { currencyFormat } from '../../utils/helpers';
import { withYearOverYear } from '../../utils/portfolio';
import ProfitBadge from './ProfitBadge';

type YearEndValuesCardProps = {
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrencies: Array<FetchedCurrency> | undefined;
	selectedAssets: Array<SelectedAsset>;
};

/** Portfolio value at the start of each year, e.g. for the Dutch Box 3 tax return. */
function YearEndValuesCard({
	currencyQuote,
	fetchedCurrencies,
	selectedAssets,
}: YearEndValuesCardProps) {
	const { isError, isLoading, yearlyTotals } = useHistoricalPortfolioValues(
		selectedAssets,
		fetchedCurrencies,
		currencyQuote
	);

	// Newest year first
	const rows = useMemo(() => withYearOverYear(yearlyTotals).reverse(), [yearlyTotals]);

	return (
		<Card className="[&>div]:p-0">
			<div className="flex flex-col gap-1 p-6 pb-2">
				<h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					Year-end values
					<Tooltip content="Holdings at the end of each year, valued at 1 January prices of the next year. This is the reference date for the Dutch Box 3 tax return.">
						<FaInfoCircle
							aria-label="About year-end values"
							className="h-3.5 w-3.5 cursor-help text-gray-400"
						/>
					</Tooltip>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Transactions marked as excluded for tax are left out
				</p>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center gap-2 p-8 text-gray-500 dark:text-gray-400">
					<Spinner color="success" size="sm" />
					Loading historical prices...
				</div>
			)}

			{isError && (
				<div className="p-6 pt-2">
					<Alert color="failure">Could not load historical prices. Try again later.</Alert>
				</div>
			)}

			{!isLoading && !isError && rows.length === 0 && (
				<p className="p-6 pt-2 text-sm text-gray-500 dark:text-gray-400">
					No completed years yet. Values appear here after your first year-end.
				</p>
			)}

			{!isLoading && !isError && rows.length > 0 && (
				<div className="overflow-x-auto">
					<Table>
						<TableHead>
							<TableHeadCell>Year</TableHeadCell>
							<TableHeadCell className="text-right">Year-end value</TableHeadCell>
							<TableHeadCell className="text-right">vs. previous year</TableHeadCell>
						</TableHead>
						<TableBody className="divide-y">
							{rows.map((row) => (
								<TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={row.year}>
									<TableCell className="font-medium text-gray-900 dark:text-white">
										{row.year}
									</TableCell>
									<TableCell className="text-right text-gray-900 dark:text-white">
										{currencyFormat(row.totalValue, currencyQuote)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end">
											{row.change === null ? '–' : <ProfitBadge percentage={row.change} />}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</Card>
	);
}

export default YearEndValuesCard;
