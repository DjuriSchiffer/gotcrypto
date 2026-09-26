import type { CurrencyQuote } from 'api';
import type { SelectedAsset, Transaction } from 'currency';
import ApexCharts from 'apexcharts';
import { useMemo, useEffect, useRef } from 'react';

import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat, dateForDisplay } from '../utils/helpers';
import { useThemeMode } from 'flowbite-react';
import { positionHistory } from '../utils/totals';

type DetailChartsProps = {
	currencyQuote: keyof CurrencyQuote;
	selectedAsset?: SelectedAsset;
};

function DetailCharts({ currencyQuote, selectedAsset }: DetailChartsProps) {
	const { dateLocale } = useStorage();
	const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';

	const amountChartRef = useRef<HTMLDivElement>(null);
	const valueChartRef = useRef<HTMLDivElement>(null);
	const costBasisChartRef = useRef<HTMLDivElement>(null);

	const amountChartInstance = useRef<ApexCharts | null>(null);
	const valueChartInstance = useRef<ApexCharts | null>(null);
	const costBasisChartInstance = useRef<ApexCharts | null>(null);

	const chartData = useMemo(() => {
		if (!selectedAsset) {
			return { amountData: [], costBasisData: [], labels: [], priceData: [], valueData: [] };
		}

		const history = positionHistory(selectedAsset.transactions);
		const lastStep = history.at(-1);
		const currentPrice =
			fetchedCurrencies?.find((currency) => currency.cmc_id === selectedAsset.cmc_id)?.price ?? 0;

		// One entry per transaction, plus a final "today" point. Every array has the same length.
		const labels = [
			...history.map((step) => dateForDisplay(step.transaction.date, dateLocale)),
			dateForDisplay(new Date().toISOString(), dateLocale),
		];

		const amountData = [...history.map((step) => step.amount), lastStep?.amount ?? 0];

		const costBasisData = [...history.map((step) => step.costBasis), lastStep?.costBasis ?? 0];

		const priceData = [
			...history.map((step) => {
				const amount = parseFloat(step.transaction.amount);
				return amount ? parseFloat(step.transaction.purchasePrice) / amount : 0;
			}),
			currentPrice,
		];

		const valueData = amountData.map((amount, i) => amount * priceData[i]);

		return { amountData, costBasisData, labels, priceData, valueData };
	}, [selectedAsset, fetchedCurrencies, dateLocale]);

	useEffect(() => {
		if (
			!selectedAsset ||
			!amountChartRef.current ||
			!valueChartRef.current ||
			!costBasisChartRef.current
		) {
			return;
		}

		const commonOptions = {
			chart: {
				group: 'transactions',
				height: 300,
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
				toolbar: {
					show: true,
					tools: {
						download: false,
						selection: true,
						zoom: false,
						zoomin: true,
						zoomout: true,
						pan: true,
						reset: true,
					},
					autoSelected: 'zoom',
					offsetX: 0,
					offsetY: 0,
				},
				zoom: {
					enabled: true,
				},
				animations: {
					enabled: true,
					easing: 'easeinout',
					speed: 800,
				},
			},
			grid: {
				show: true,
				strokeDashArray: 6,
				xaxis: {
					lines: {
						show: false,
					},
				},
				yaxis: {
					lines: {
						show: true,
					},
				},
				row: {
					colors: undefined,
					opacity: 0.1,
				},
				column: {
					colors: undefined,
					opacity: 0.1,
				},
				padding: {
					left: 16,
					right: 16,
					top: 16,
					bottom: 16,
				},
			},
			tooltip: {
				shared: true,
				fixed: {
					enabled: false,
				},
				fillSeriesColor: false,
			},
			dataLabels: {
				enabled: false,
			},
			legend: {
				show: false,
			},
			xaxis: {
				tooltip: false,
				categories: chartData.labels,
			},
			markers: {
				size: 4,
				strokeWidth: 0,
				hover: {
					size: 8,
				},
				discrete: [],
			},
		};

		const amountOptions = {
			...commonOptions,
			chart: {
				...commonOptions.chart,
				id: 'amount',
				type: 'line',
				height: 300,
			},
			title: {
				text: 'Amount',
				align: 'left',
			},
			series: [
				{
					name: 'Amount',
					data: chartData.amountData,
					color: '#1C64F2',
					type: 'line',
				},
			],
			stroke: {
				width: 4,
				curve: 'stepline',
				lineCap: 'round',
			},
			yaxis: {
				labels: {
					formatter: function (value: number) {
						return value.toFixed(4);
					},
				},
				forceNiceScale: true,
				tickAmount: 6,
				floating: false,
				min: function (min: number) {
					if (min >= 0) return 0;
					return min * 0.9;
				},
				max: function (max: number) {
					return max * 1.2;
				},
			},
			tooltip: {
				...commonOptions.tooltip,
				y: {
					formatter: function (value: number) {
						return `${value.toFixed(4)}`;
					},
				},
			},
			markers: {
				...commonOptions.markers,
				colors: ['#1C64F2'],
			},
		};

		const valueOptions = {
			...commonOptions,
			chart: {
				...commonOptions.chart,
				id: 'value',
				type: 'line',
				height: 300,
			},
			title: {
				text: 'Portfolio Value',
				align: 'left',
			},
			series: [
				{
					name: 'Value',
					data: chartData.valueData,
					color: '#10B981',
					type: 'line',
				},
			],
			stroke: {
				width: 4,
				curve: 'smooth',
				lineCap: 'round',
			},
			yaxis: {
				labels: {
					formatter: function (value: number) {
						return currencyFormat(value, currencyQuote);
					},
				},
				forceNiceScale: true,
				tickAmount: 6,
				floating: false,
				min: function (min: number) {
					if (min >= 0) return 0;
					return min * 0.9;
				},
				max: function (max: number) {
					return max * 1.2;
				},
			},
			tooltip: {
				...commonOptions.tooltip,
				y: {
					formatter: function (value: number) {
						return `${currencyFormat(value, currencyQuote)}`;
					},
				},
			},
			markers: {
				...commonOptions.markers,
				colors: ['#10B981'],
			},
		};

		const costBasisOptions = {
			...commonOptions,
			chart: {
				...commonOptions.chart,
				id: 'costBasis',
				type: 'line',
				height: 300,
			},
			title: {
				text: 'Cost basis',
				align: 'left',
			},
			series: [
				{
					name: 'Cost basis',
					data: chartData.costBasisData,
					color: '#EF4444',
					type: 'line',
				},
			],
			stroke: {
				width: 4,
				curve: 'smooth',
			},
			yaxis: {
				labels: {
					formatter: function (value: number) {
						return currencyFormat(value, currencyQuote);
					},
				},
				forceNiceScale: true,
				tickAmount: 6,
				floating: false,
				min: function (min: number) {
					return Math.min(0, min * 1.2);
				},
				max: function (max: number) {
					return Math.max(0, max * 1.2);
				},
			},
			tooltip: {
				...commonOptions.tooltip,
				y: {
					formatter: function (value: number) {
						return `${currencyFormat(value, currencyQuote)}`;
					},
				},
			},
			markers: {
				...commonOptions.markers,
				colors: ['#EF4444'],
			},
		};

		if (amountChartInstance.current) {
			amountChartInstance.current.destroy();
		}
		if (valueChartInstance.current) {
			valueChartInstance.current.destroy();
		}
		if (costBasisChartInstance.current) {
			costBasisChartInstance.current.destroy();
		}

		amountChartInstance.current = new ApexCharts(amountChartRef.current, amountOptions);
		valueChartInstance.current = new ApexCharts(valueChartRef.current, valueOptions);
		costBasisChartInstance.current = new ApexCharts(costBasisChartRef.current, costBasisOptions);

		amountChartInstance.current.render();
		valueChartInstance.current.render();
		costBasisChartInstance.current.render();

		return () => {
			if (amountChartInstance.current) {
				amountChartInstance.current.destroy();
			}
			if (valueChartInstance.current) {
				valueChartInstance.current.destroy();
			}
			if (costBasisChartInstance.current) {
				costBasisChartInstance.current.destroy();
			}
		};
	}, [chartData, currencyQuote, selectedAsset]);

	if (!selectedAsset) {
		return <div>No currency selected.</div>;
	}

	return (
		<div className="flex h-auto w-full flex-col space-y-6">
			<div ref={valueChartRef} className="h-[300px] w-full"></div>
			<div ref={amountChartRef} className="h-[300px] w-full"></div>
			<div ref={costBasisChartRef} className="h-[300px] w-full"></div>
		</div>
	);
}

export default DetailCharts;
