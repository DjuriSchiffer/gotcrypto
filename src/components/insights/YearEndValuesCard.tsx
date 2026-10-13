import type { CurrencyQuote } from 'api';
import type { SelectedAsset } from 'currency';

import {
	Alert,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
} from 'flowbite-react';
import { useMemo } from 'react';

import { useHistoricalPortfolioValues } from '../../hooks/useHistoricalPortfolioValues';
import { currencyFormat } from '../../utils/helpers';
import { withYearOverYear } from '../../utils/portfolio';
import HintIcon from '../ui/HintIcon';
import ProfitBadge from '../ui/ProfitBadge';
import SectionCard from '../ui/SectionCard';

type YearEndValuesCardProps = {
	currencyQuote: keyof CurrencyQuote;
	selectedAssets: Array<SelectedAsset>;
};

/** Portfolio value at the start of each year, e.g. for the Dutch Box 3 tax return. */
function YearEndValuesCard({ currencyQuote, selectedAssets }: YearEndValuesCardProps) {
	const { hasMissingPrices, isLoading, yearlyTotals } = useHistoricalPortfolioValues(
		selectedAssets,
		currencyQuote
	);

	// Newest year first
	const rows = useMemo(() => withYearOverYear(yearlyTotals).reverse(), [yearlyTotals]);

	return (
		<SectionCard
			description="Transactions marked as excluded for tax are left out"
			flush
			hint="Holdings at the end of each year, valued at 1 January prices of the next year. This is the reference date for the Dutch Box 3 tax return."
			title="Year-end values"
		>
			{isLoading && (
				<div className="flex items-center justify-center gap-2 p-8 text-gray-500 dark:text-gray-400">
					<Spinner size="sm" />
					Loading historical prices...
				</div>
			)}

			{hasMissingPrices && (
				<div className="px-6 pb-4">
					<Alert color="warning">
						Some historical prices couldn't be loaded. Years marked “Price unavailable” are
						incomplete: don't use them for your tax return. Try again later.
					</Alert>
				</div>
			)}

			{!isLoading && rows.length === 0 && (
				<p className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400">
					No completed years yet. Values appear here after your first year-end.
				</p>
			)}

			{!isLoading && rows.length > 0 && (
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
										{row.missingAssets.length > 0 ? (
											<div className="flex items-center justify-end gap-1.5 text-amber-700 dark:text-amber-400">
												Price unavailable
												<HintIcon hint={`No year-end price for ${row.missingAssets.join(', ')}`} />
											</div>
										) : (
											currencyFormat(row.totalValue, currencyQuote)
										)}
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
		</SectionCard>
	);
}

export default YearEndValuesCard;
