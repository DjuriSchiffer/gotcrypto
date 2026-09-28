import type { CurrencyQuote } from 'api';
import type { Transaction } from 'currency';

import { useMemo } from 'react';

import { useAppState } from '../../hooks/useAppState';
import { currencyFormat, dateForDisplay } from '../../utils/helpers';
import { positionHistory } from '../../utils/totals';
import ApexChart from '../ApexChart';
import SectionCard from '../ui/SectionCard';

type Options = ApexCharts.ApexOptions;

type DetailChartsProps = {
	currencyQuote: keyof CurrencyQuote;
	currentPrice: number;
	transactions: Array<Transaction>;
};

/** Settings shared by all three charts. Charts in the same group show synced tooltips. */
const baseOptions = (labels: Array<string>): Options => ({
	chart: {
		animations: { enabled: true, speed: 800 },
		background: 'transparent',
		fontFamily: 'Inter, sans-serif',
		group: 'transactions',
		height: 280,
		toolbar: {
			show: true,
			tools: {
				download: false,
				pan: true,
				reset: true,
				selection: true,
				zoom: false,
				zoomin: true,
				zoomout: true,
			},
		},
		type: 'line',
		zoom: { enabled: true },
	},
	dataLabels: { enabled: false },
	grid: {
		padding: { left: 8, right: 16 },
		strokeDashArray: 6,
		xaxis: { lines: { show: false } },
		yaxis: { lines: { show: true } },
	},
	legend: { show: false },
	markers: { hover: { size: 8 }, size: 4, strokeWidth: 0 },
	tooltip: { fillSeriesColor: false, shared: true },
	xaxis: { categories: labels, tooltip: { enabled: false } },
});

type ChartSpec = {
	color: string;
	curve: 'smooth' | 'stepline';
	data: Array<number>;
	format: (value: number) => string;
	id: string;
	name: string;
};

const chartOptions = (labels: Array<string>, spec: ChartSpec): Options => {
	const base = baseOptions(labels);

	return {
		...base,
		chart: { ...base.chart, id: spec.id },
		markers: { ...base.markers, colors: [spec.color] },
		series: [{ color: spec.color, data: spec.data, name: spec.name }],
		stroke: { curve: spec.curve, lineCap: 'round', width: 4 },
		tooltip: { ...base.tooltip, y: { formatter: spec.format } },
		yaxis: {
			forceNiceScale: true,
			labels: { formatter: spec.format },
			// Start at zero unless there are negative values, and leave room above the line
			max: (max: number) => max * 1.2,
			min: (min: number) => Math.min(0, min * 1.2),
			tickAmount: 5,
		},
	};
};

/** Value, amount and cost basis over time: one point per transaction, plus today. */
function DetailCharts({ currencyQuote, currentPrice, transactions }: DetailChartsProps) {
	const { dateLocale } = useAppState();

	const { amount, costBasis, value } = useMemo(() => {
		const history = positionHistory(transactions);
		const lastStep = history.at(-1);
		const money = (number: number) => currencyFormat(number, currencyQuote);

		// One entry per transaction, plus a final "today" point, so every array has the same length
		const labels = [
			...history.map((step) => dateForDisplay(step.transaction.date, dateLocale)),
			dateForDisplay(new Date().toISOString(), dateLocale),
		];

		const amountData = [...history.map((step) => step.amount), lastStep?.amount ?? 0];
		const costBasisData = [...history.map((step) => step.costBasis), lastStep?.costBasis ?? 0];
		const priceData = [
			...history.map((step) => {
				const quantity = parseFloat(step.transaction.amount);
				return quantity ? parseFloat(step.transaction.purchasePrice) / quantity : 0;
			}),
			currentPrice,
		];
		const valueData = amountData.map((holding, index) => holding * priceData[index]);

		return {
			amount: chartOptions(labels, {
				color: '#1C64F2',
				curve: 'stepline',
				data: amountData,
				format: (number) => number.toFixed(4),
				id: 'amount',
				name: 'Amount',
			}),
			costBasis: chartOptions(labels, {
				color: '#EF4444',
				curve: 'stepline',
				data: costBasisData,
				format: money,
				id: 'cost-basis',
				name: 'Cost basis',
			}),
			value: chartOptions(labels, {
				color: '#10B981',
				curve: 'smooth',
				data: valueData,
				format: money,
				id: 'value',
				name: 'Value',
			}),
		};
	}, [transactions, currentPrice, currencyQuote, dateLocale]);

	return (
		<div className="flex flex-col gap-4">
			<SectionCard description="Holdings × price at each transaction, and today" title="Value">
				<ApexChart className="min-w-0" options={value} />
			</SectionCard>
			<SectionCard description="Coins held after each transaction" title="Amount">
				<ApexChart className="min-w-0" options={amount} />
			</SectionCard>
			<SectionCard
				description="What the coins you hold cost you"
				hint="Drops at a sell by the average cost of the coins sold, not by the sale price."
				title="Cost basis"
			>
				<ApexChart className="min-w-0" options={costBasis} />
			</SectionCard>
		</div>
	);
}

export default DetailCharts;
