import type { CurrencyQuote } from 'api';
import type { ChartData, ChartOptions } from 'chart.js';
import type { SelectedAsset, Transaction } from 'currency';

import {
	ArcElement,
	CategoryScale,
	Chart as ChartJS,
	Title as ChartTitle,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat, dateForDisplay } from '../utils/helpers';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ChartTitle,
	Tooltip,
	Legend,
	ArcElement
);

type DetailChartsProps = {
	currencyQuote: keyof CurrencyQuote;
	selectedAsset?: SelectedAsset;
};

function DetailCharts({ currencyQuote, selectedAsset }: DetailChartsProps) {
	const { dateLocale } = useStorage();
	const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);

	// Move useMemo before any conditional returns
	const chartData = useMemo(() => {
		// If no selected asset, return empty data structure
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

	// Early return after useMemo
	if (!selectedAsset) {
		return <div>No currency selected.</div>;
	}

	const options: ChartOptions<'line'> = {
		interaction: {
			intersect: true,
			mode: 'index',
		},
		plugins: {
			legend: {
				labels: {
					color: 'white',
				},
			},
			title: {
				color: 'white',
				display: true,
				text: 'Transaction Overview',
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const value = Number(context.parsed.y);
						const label = context.dataset.label || '';

						if (label === 'Value')
							return 'Portfolio Value: ' + currencyFormat(value, currencyQuote);
						if (label === 'Invested')
							return 'Total invested: ' + currencyFormat(value, currencyQuote);
						if (label === 'Price') return 'Price Per Unit: ' + currencyFormat(value, currencyQuote);
						return `${label}: ${value.toFixed(4)}`;
					},
				},
			},
		},
		responsive: true,
		scales: {
			x: {
				ticks: {
					color: 'white',
				},
			},
			y: {
				display: true,
				position: 'left',
				ticks: {
					callback: (value) => Number(value),
					color: 'white',
				},
				type: 'linear',
			},
			y1: {
				display: true,
				grid: {
					drawOnChartArea: false,
				},
				position: 'right',
				ticks: {
					callback: (value) => currencyFormat(Number(value), currencyQuote),
					color: 'white',
				},
				type: 'linear',
			},
		},
	};

	const chartDataConfig: ChartData<'line'> = {
		datasets: [
			{
				backgroundColor: '#1A56DB', // blue 700
				borderColor: '#1C64F2', // blue 600
				data: chartData.amountData,
				label: 'Amount',
				stepped: 'before',
				tension: 0,
				yAxisID: 'y',
			},
			{
				backgroundColor: '#059669', // green 600
				borderColor: '#10B981', // green 500
				data: chartData.valueData,
				label: 'Value',
				stepped: false,
				tension: 0,
				yAxisID: 'y1',
			},
			{
				backgroundColor: '#DC2626', // red 600
				borderColor: '#EF4444', // red 500
				data: chartData.investedData,
				label: 'Invested',
				stepped: false,
				tension: 0,
				yAxisID: 'y1',
			},
		],
		labels: chartData.labels,
	};

	return <Line data={chartDataConfig} options={options} />;
}

export default DetailCharts;
