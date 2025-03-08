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

  // Calculate cumulative amounts at each transaction point
  const amountData: number[] = [];
  let cumulativeAmount = 0;

  transactions.forEach(transaction => {
    cumulativeAmount += parseFloat(transaction.amount);
    amountData.push(cumulativeAmount);
  });

  // Add current amount as the final point
  amountData.push(cumulativeAmount);

  // Calculate cumulative spent amount at each transaction point
  const spentData: number[] = [];
  let totalSpent = 0;

  transactions.forEach(transaction => {
    totalSpent += parseFloat(transaction.purchasePrice);
    spentData.push(totalSpent);
  });

  // Add current spent amount as the final point (doesn't change since last transaction)
  spentData.push(totalSpent);

  // Find current price from API data
  const currentCurrency = fetchedCurrencies?.find(
    (currency) => currency.cmc_id === selectedAsset.cmc_id
  );
  const currentPrice = currentCurrency?.price ?? 0;

  // Calculate price per unit for each transaction (implied historical price)
  const priceData: number[] = transactions.map(transaction =>
    parseFloat(transaction.purchasePrice) / parseFloat(transaction.amount)
  );
  // Add current price as the final point
  priceData.push(currentPrice);

  // Calculate portfolio value at each point using historical implied prices
  const valueData: number[] = [];

  // For each historical point, calculate the value using that day's implied price
  for (let i = 0; i < transactions.length; i++) {
    const pricePerUnit = priceData[i];
    const portfolioValue = amountData[i] * pricePerUnit;
    valueData.push(portfolioValue);
  }

  // Add current value as the final point using current price
  valueData.push(cumulativeAmount * currentPrice);

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
              return 'Portfolio Value: ' + currencyFormat(Number(context.parsed.y), currencyQuote);
            }
            if (context.dataset.label === 'Spent') {
              return 'Amount Spent: ' + currencyFormat(Number(context.parsed.y), currencyQuote);
            }
            if (context.dataset.label === 'Price') {
              return 'Price Per Unit: ' + currencyFormat(Number(context.parsed.y), currencyQuote);
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
      // {
      //   label: 'Price',
      //   data: priceData,
      //   borderColor: '#10B981', // green 500
      //   backgroundColor: '#059669', // green 600
      //   yAxisID: 'y1',
      //   stepped: 'before',
      //   tension: 0,
      // },
      {
        label: 'Value',
        data: valueData,
        borderColor: '#10B981', // green 500
        backgroundColor: '#059669', // green 600
        yAxisID: 'y1',
        stepped: false,
        tension: 0,
      },
      {
        label: 'Spent',
        data: spentData,
        borderColor: '#EF4444', // red 500
        backgroundColor: '#DC2626', // red 600
        yAxisID: 'y1',
        stepped: false,
        tension: 0,
      },
    ],
  };

  return <Line data={chartData} options={options} />;
};

export default DetailCharts;