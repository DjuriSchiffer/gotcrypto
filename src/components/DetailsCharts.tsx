import type { CurrencyQuote } from 'api';
import type { SelectedAsset, Transaction } from 'currency';
import ApexCharts from 'apexcharts';
import { useMemo, useEffect, useRef } from 'react';

import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat, dateForDisplay } from '../utils/helpers';

type DetailChartsProps = {
	currencyQuote: keyof CurrencyQuote;
	selectedAsset?: SelectedAsset;
};

function DetailCharts({ currencyQuote, selectedAsset }: DetailChartsProps) {
	const { dateLocale } = useStorage();
	const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);

	const amountChartRef = useRef<HTMLDivElement>(null);
	const valueChartRef = useRef<HTMLDivElement>(null);
	const investedChartRef = useRef<HTMLDivElement>(null);

	const amountChartInstance = useRef<ApexCharts | null>(null);
	const valueChartInstance = useRef<ApexCharts | null>(null);
	const investedChartInstance = useRef<ApexCharts | null>(null);

	const chartData = useMemo(() => {
		if (!selectedAsset) {
			return {
				amountData: [],
				investedData: [],
				labels: [],
				priceData: [],
				valueData: [],
			};
		}

		const transactions: Array<Transaction> = [...selectedAsset.transactions].reverse();
		const today = new Date();

		const isNegativeTransaction = (transaction: Transaction): boolean =>
			transaction.type === 'sell' ||
			(transaction.type === 'transfer' && transaction.transferType === 'out');

		const labels: Array<string> = [
			...transactions.map((transaction) => {
				const date = new Date(transaction.date);
				return dateForDisplay(date.toISOString(), dateLocale);
			}),
			dateForDisplay(today.toISOString(), dateLocale),
		];

		const amountData: Array<number> = [];
		const investedData: Array<number> = [];
		const priceData: Array<number> = [];

		let cumulativeAmount = 0;
		let totalSpent = 0;

		transactions.forEach((transaction) => {
			const amount = parseFloat(transaction.amount);
			const purchasePrice = parseFloat(transaction.purchasePrice);

			if (isNegativeTransaction(transaction)) {
				cumulativeAmount -= amount;
			} else {
				cumulativeAmount += amount;
			}
			amountData.push(cumulativeAmount);

			if (transaction.type === 'sell') {
				totalSpent -= purchasePrice;
			} else if (transaction.type === 'buy') {
				totalSpent += purchasePrice;
			}
			investedData.push(totalSpent);

			priceData.push(purchasePrice / amount);
		});

		const currentCurrency = fetchedCurrencies?.find(
			(currency) => currency.cmc_id === selectedAsset.cmc_id
		);
		const currentPrice = currentCurrency?.price ?? 0;

		amountData.push(cumulativeAmount);
		investedData.push(totalSpent);
		priceData.push(currentPrice);

		const valueData: Array<number> = amountData.map((amount, i) => amount * priceData[i]);

		return {
			amountData,
			investedData,
			labels,
			priceData,
			valueData,
		};
	}, [selectedAsset, fetchedCurrencies, dateLocale]);

	useEffect(() => {
		if (
			!selectedAsset ||
			!amountChartRef.current ||
			!valueChartRef.current ||
			!investedChartRef.current
		) {
			return;
		}

		const commonOptions = {
			chart: {
				group: 'crypto-transactions',
				height: 300,
				fontFamily: 'Inter, sans-serif',
				background: 'transparent', // Ensure transparent background
				foreColor: '#ffffff', // Set default text color for dark theme
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
					background: '#FFFFFF',
					offsetX: 0,
					offsetY: 0,
					style: {
						color: '#000000',
					},
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
				borderColor: 'red',
				strokeDashArray: 6,
				position: 'back',
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
				theme: 'dark',
				style: {
					fontSize: '12px',
					fontFamily: 'Inter, sans-serif',
				},
				marker: {
					show: true,
				},
				fixed: {
					enabled: false,
				},
				fillSeriesColor: false,
				backgroundColor: '#FFFFFF',
				borderColor: '#e3e3e3',
				opacity: 1,
			},
			dataLabels: {
				enabled: false,
			},
			legend: {
				show: false,
			},
			xaxis: {
				categories: chartData.labels,
				labels: {
					style: {
						colors: '#ffffff',
						fontFamily: 'Inter, sans-serif',
						cssClass: 'text-xs font-normal',
					},
				},
				axisBorder: {
					color: '#6B7280',
				},
				axisTicks: {
					color: '#6B7280',
				},
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
				style: {
					color: '#ffffff',
				},
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
				title: {
					text: 'Amount',
					style: {
						color: '#ffffff',
					},
				},
				labels: {
					formatter: function (value: number) {
						return value.toFixed(4);
					},
					style: {
						colors: '#ffffff',
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
						return `Amount: ${value.toFixed(4)}`;
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
				style: {
					color: '#ffffff',
				},
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
				title: {
					text: 'Value',
					style: {
						color: '#ffffff',
					},
				},
				labels: {
					formatter: function (value: number) {
						return currencyFormat(value, currencyQuote);
					},
					style: {
						colors: '#ffffff',
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
						return `Value: ${currencyFormat(value, currencyQuote)}`;
					},
				},
			},
			markers: {
				...commonOptions.markers,
				colors: ['#10B981'],
			},
		};

		const investedOptions = {
			...commonOptions,
			chart: {
				...commonOptions.chart,
				id: 'invested',
				type: 'line',
				height: 300,
			},
			title: {
				text: 'Total Invested',
				align: 'left',
				style: {
					color: '#ffffff',
				},
			},
			series: [
				{
					name: 'Invested',
					data: chartData.investedData,
					color: '#EF4444',
					type: 'line',
				},
			],
			stroke: {
				width: 4,
				curve: 'smooth',
			},
			yaxis: {
				title: {
					text: 'Invested',
					style: {
						color: '#ffffff',
					},
				},
				labels: {
					formatter: function (value: number) {
						return currencyFormat(value, currencyQuote);
					},
					style: {
						colors: '#ffffff',
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
						return `Invested: ${currencyFormat(value, currencyQuote)}`;
					},
				},
			},
			annotations: {
				yaxis: [
					{
						y: 0,
						borderColor: '#6B7280',
						strokeDashArray: 0,
					},
				],
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
		if (investedChartInstance.current) {
			investedChartInstance.current.destroy();
		}

		amountChartInstance.current = new ApexCharts(amountChartRef.current, amountOptions);
		valueChartInstance.current = new ApexCharts(valueChartRef.current, valueOptions);
		investedChartInstance.current = new ApexCharts(investedChartRef.current, investedOptions);

		amountChartInstance.current.render();
		valueChartInstance.current.render();
		investedChartInstance.current.render();

		return () => {
			if (amountChartInstance.current) {
				amountChartInstance.current.destroy();
			}
			if (valueChartInstance.current) {
				valueChartInstance.current.destroy();
			}
			if (investedChartInstance.current) {
				investedChartInstance.current.destroy();
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
			<div ref={investedChartRef} className="h-[300px] w-full"></div>
		</div>
	);
}

export default DetailCharts;
