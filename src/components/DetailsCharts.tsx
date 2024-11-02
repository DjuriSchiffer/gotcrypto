import React from 'react';
import { currencyFormat } from '../utils/calculateHelpers';
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
import { Transaction, SelectedCurrency } from 'currency';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { CurrencyQuote } from 'api';

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
  selectedCurrency?: SelectedCurrency;
  currencyQuote: keyof CurrencyQuote;
}

const DetailCharts: React.FC<DetailChartsProps> = ({ selectedCurrency, currencyQuote }) => {
  const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);

  if (!selectedCurrency) {
    return <div>No currency selected.</div>;
  }

  const transactions: Transaction[] = [...selectedCurrency.transactions].reverse();
  const labels: string[] = transactions.map((transaction) => {
    const date = new Date(transaction.date);
    return date.toLocaleDateString('nl', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  });

  const amountData: number[] = transactions.map((_, index) => {
    const transactionsUpToIndex = transactions.slice(0, index + 1);
    return transactionsUpToIndex.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
  });

  const currentCurrency = fetchedCurrencies?.find(
    (currency) => currency.cmc_id === selectedCurrency.cmc_id
  );
  const currentPrice = currentCurrency?.price ?? 0;
  const holdingsData: number[] = amountData.map(amount => amount * currentPrice);

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
          callback: (value) => Number(value).toFixed(4),
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
            if (context.dataset.label === 'Holdings') {
              return 'Holdings: ' + currencyFormat(Number(context.parsed.y), currencyQuote);
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
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
        stepped: 'before',
        tension: 0,
      },
      {
        label: 'Holdings',
        data: holdingsData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        stepped: 'before',
        tension: 0,
      },
    ],
  };

  return <Line data={chartData} options={options} />;
};

export default DetailCharts;