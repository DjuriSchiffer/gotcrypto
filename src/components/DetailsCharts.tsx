import React from 'react';
import { currencyFormat, dateForDisplay } from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction, SelectedAsset } from 'currency';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { CurrencyQuote } from 'api';
import { useStorage } from '../hooks/useStorage';

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

interface DetailChartsProps {
  selectedAsset?: SelectedAsset;
  currencyQuote: keyof CurrencyQuote;
}

const DetailCharts: React.FC<DetailChartsProps> = ({ selectedAsset, currencyQuote }) => {
  const { dateLocale } = useStorage();
  const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);

  if (!selectedAsset) {
    return <div>No currency selected.</div>;
  }

  const transactions: Transaction[] = [...selectedAsset.transactions].reverse();
  const today = new Date();

  // Format dates consistently using dateForDisplay
  const labels: string[] = [
    ...transactions.map((transaction) => {
      // Convert the transaction date to ISO string for consistent handling
      const date = new Date(transaction.date);
      const isoString = date.toISOString();
      return dateForDisplay(isoString, dateLocale);
    }),
    dateForDisplay(today.toISOString(), dateLocale)
  ];

  const amountData: number[] = [
    ...transactions.map((_, index) => {
      const transactionsUpToIndex = transactions.slice(0, index + 1);
      return transactionsUpToIndex.reduce((sum, transaction) =>
        sum + parseFloat(transaction.amount), 0);
    })
  ];

  const currentAmount = amountData[amountData.length - 1] || 0;
  amountData.push(currentAmount);

  const currentCurrency = fetchedCurrencies?.find(
    (currency) => currency.cmc_id === selectedAsset.cmc_id
  );
  const currentPrice = currentCurrency?.price ?? 0;
  const valueData: number[] = amountData.map(amount => amount * currentPrice);

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: true,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: 'white',
          callback: (value) => Number(value),
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: 'white',
          callback: (value) => currencyFormat(Number(value), currencyQuote),
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === 'Value') {
              return 'Value: ' + currencyFormat(Number(context.parsed.y), currencyQuote);
            }
            return `${context.dataset.label}: ${Number(context.parsed.y).toFixed(4)}`;
          },
        },
      },
      title: {
        display: true,
        text: 'Transaction Overview',
        color: 'white',
      },
    },
  };

  const chartData: ChartData<'line'> = {
    labels: labels,
    datasets: [
      {
        label: 'Amount',
        data: amountData,
        borderColor: '#1C64F2', // blue 600
        backgroundColor: '#1A56DB', // blue 700
        yAxisID: 'y',
        stepped: 'before',
        tension: 0,
      },
      {
        label: 'Value',
        data: valueData,
        borderColor: '#C27803', // yellow 500
        backgroundColor: '#9F580A', // yellow 600
        yAxisID: 'y1',
        stepped: 'before',
        tension: 0,
      },
    ],
  };

  return <Line data={chartData} options={options} />;
};

export default DetailCharts;