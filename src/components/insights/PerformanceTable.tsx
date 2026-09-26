import type { CurrencyQuote } from 'api';

import classNames from 'classnames';
import {
	Badge,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
} from 'flowbite-react';
import { useMemo, useState } from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import type { AssetBreakdown } from '../../utils/portfolio';

import { currencyFormat, profitClass } from '../../utils/helpers';
import { getImage } from '../../utils/images';
import ProfitBadge from '../ui/ProfitBadge';
import SectionCard from '../ui/SectionCard';

type SortKey = 'costBasis' | 'realizedProfit' | 'totalProfit' | 'unrealizedProfit' | 'value';

const COLUMNS: Array<{ key: SortKey; label: string }> = [
	{ key: 'value', label: 'Value' },
	{ key: 'costBasis', label: 'Cost basis' },
	{ key: 'unrealizedProfit', label: 'Unrealized' },
	{ key: 'realizedProfit', label: 'Realized' },
	{ key: 'totalProfit', label: 'Total P/L' },
];

type PerformanceTableProps = {
	currencyQuote: keyof CurrencyQuote;
	rows: Array<AssetBreakdown>;
};

/** Every asset side by side, sortable by clicking a column header. */
function PerformanceTable({ currencyQuote, rows }: PerformanceTableProps) {
	const [sortKey, setSortKey] = useState<SortKey>('value');
	const [descending, setDescending] = useState(true);

	const sortedRows = useMemo(
		() =>
			[...rows].sort((a, b) => (descending ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey])),
		[rows, sortKey, descending]
	);

	const handleSort = (key: SortKey) => {
		if (key === sortKey) {
			setDescending((current) => !current);
		} else {
			setSortKey(key);
			setDescending(true);
		}
	};

	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
		<SectionCard description="Click a column to sort" flush title="Performance per asset">
			<div className="overflow-x-auto">
				<Table hoverable>
					<TableHead>
						<TableHeadCell>Asset</TableHeadCell>
						{COLUMNS.map((column) => {
							const isActive = column.key === sortKey;
							const Icon = !isActive ? FaSort : descending ? FaSortDown : FaSortUp;

							return (
								<TableHeadCell
									aria-sort={isActive ? (descending ? 'descending' : 'ascending') : 'none'}
									className="text-right"
									key={column.key}
								>
									<button
										className={classNames(
											'inline-flex items-center gap-1 uppercase',
											isActive && 'text-gray-900 dark:text-white'
										)}
										onClick={() => handleSort(column.key)}
										type="button"
									>
										{column.label}
										<Icon aria-hidden className="h-3 w-3" />
									</button>
								</TableHeadCell>
							);
						})}
					</TableHead>
					<TableBody className="divide-y">
						{sortedRows.map((row) => (
							<TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={row.cmcId}>
								<TableCell className="whitespace-nowrap">
									<Link className="flex items-center gap-3" to={`/${row.slug}`}>
										<img
											alt=""
											className="h-7 w-7 rounded-full"
											height={28}
											src={getImage(row.cmcId)}
											width={28}
										/>
										<span className="flex flex-col">
											<span className="font-medium text-gray-900 hover:underline dark:text-white">
												{row.name}
											</span>
											{row.isClosed ? (
												<Badge className="mt-0.5 w-fit" color="gray" size="xs">
													Closed
												</Badge>
											) : (
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{row.allocation.toFixed(1)}% of portfolio
												</span>
											)}
										</span>
									</Link>
								</TableCell>
								<TableCell className="text-right text-gray-900 dark:text-white">
									{money(row.value)}
								</TableCell>
								<TableCell className="text-right">{money(row.costBasis)}</TableCell>
								<TableCell className={classNames('text-right', profitClass(row.unrealizedProfit))}>
									{money(row.unrealizedProfit)}
								</TableCell>
								<TableCell className={classNames('text-right', profitClass(row.realizedProfit))}>
									{row.hasSold ? money(row.realizedProfit) : '–'}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex flex-col items-end gap-1">
										<span className={classNames('font-semibold', profitClass(row.totalProfit))}>
											{money(row.totalProfit)}
										</span>
										<ProfitBadge percentage={row.totalProfitPercentage} />
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</SectionCard>
	);
}

export default PerformanceTable;
