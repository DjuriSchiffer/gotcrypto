import type { CurrencyQuote } from 'api';

import { Card, useThemeMode } from 'flowbite-react';
import { useMemo } from 'react';

import type { AssetBreakdown } from '../../utils/portfolio';

import { currencyFormat } from '../../utils/helpers';
import { getAllocationSlices, OTHER_LABEL } from '../../utils/portfolio';
import ApexChart from '../ApexChart';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
const OTHER_COLOR = '#9CA3AF';

type AllocationCardProps = {
	currencyQuote: keyof CurrencyQuote;
	rows: Array<AssetBreakdown>;
	totalValue: number;
};

/** Donut chart of where the portfolio value sits, with a list that doubles as the legend. */
function AllocationCard({ currencyQuote, rows, totalValue }: AllocationCardProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';

	const slices = useMemo(() => getAllocationSlices(rows, COLORS.length), [rows]);
	const hasOther = slices.at(-1)?.label === OTHER_LABEL;
	const namedSliceCount = hasOther ? slices.length - 1 : slices.length;
	const colorFor = (index: number) => (index < namedSliceCount ? COLORS[index] : OTHER_COLOR);

	const openPositions = rows.filter((row) => row.value > 0);

	const options = useMemo<ApexCharts.ApexOptions>(() => {
		const textColor = isDarkMode ? '#F9FAFB' : '#111827';
		const mutedColor = isDarkMode ? '#9CA3AF' : '#6B7280';
		const money = (value: number) => currencyFormat(value, currencyQuote);

		return {
			chart: {
				background: 'transparent',
				fontFamily: 'Inter, sans-serif',
				height: 280,
				type: 'donut',
			},
			colors: slices.map((_, index) => colorFor(index)),
			dataLabels: { enabled: false },
			labels: slices.map((slice) => slice.label),
			legend: { show: false },
			plotOptions: {
				pie: {
					donut: {
						labels: {
							name: { color: mutedColor, show: true },
							show: true,
							total: {
								formatter: () => money(totalValue),
								label: 'Total value',
								show: true,
							},
							value: {
								color: textColor,
								fontSize: '20px',
								fontWeight: 700,
								formatter: (value: string) => money(Number(value)),
								show: true,
							},
						},
						size: '72%',
					},
				},
			},
			series: slices.map((slice) => slice.value),
			// Separate the slices with the card's background color
			stroke: { colors: [isDarkMode ? '#1F2937' : '#FFFFFF'], width: 2 },
			tooltip: { y: { formatter: money } },
		};
		// colorFor only depends on slices, which is already listed
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slices, isDarkMode, currencyQuote, totalValue]);

	return (
		<Card className="h-full">
			<div className="flex flex-col gap-4">
				<div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Allocation</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">Where your current value sits</p>
				</div>

				{openPositions.length === 0 ? (
					<p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
						No open positions.
					</p>
				) : (
					<div className="grid items-center gap-6 md:grid-cols-2">
						<ApexChart className="min-w-0" options={options} />

						<ul className="flex flex-col gap-3">
							{openPositions.map((row, index) => (
								<li className="flex flex-col gap-1" key={row.cmcId}>
									<div className="flex items-center justify-between gap-2 text-sm">
										<span className="flex min-w-0 items-center gap-2">
											<span
												aria-hidden
												className="h-2.5 w-2.5 shrink-0 rounded-full"
												style={{ backgroundColor: colorFor(index) }}
											/>
											<span className="truncate font-medium text-gray-900 dark:text-white">
												{row.name}
											</span>
										</span>
										<span className="shrink-0 text-gray-500 dark:text-gray-400">
											{currencyFormat(row.value, currencyQuote)} · {row.allocation.toFixed(1)}%
										</span>
									</div>
									<div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
										<div
											className="h-1.5 rounded-full"
											style={{ backgroundColor: colorFor(index), width: `${row.allocation}%` }}
										/>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</Card>
	);
}

export default AllocationCard;
