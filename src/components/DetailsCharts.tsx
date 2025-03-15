import React, { useMemo } from 'react';
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

  const chartData = useMemo(() => {
    const transactions: Transaction[] = [...selectedAsset.transactions].reverse();
    const today = new Date();

    const isNegativeTransaction = (transaction: Transaction): boolean =>
      transaction.type === 'sell' || (transaction.type === 'transfer' && transaction.transferType === 'out');

    const labels: string[] = [
      ...transactions.map((transaction) => {
        const date = new Date(transaction.date);
        return dateForDisplay(date.toISOString(), dateLocale);
      }),
      dateForDisplay(today.toISOString(), dateLocale)
    ];

    const amountData: number[] = [];
    const investedData: number[] = [];
    const priceData: number[] = [];

    let cumulativeAmount = 0;
    let totalSpent = 0;

    transactions.forEach(transaction => {
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

    const valueData: number[] = amountData.map((amount, i) => amount * priceData[i]);

    return {
      labels,
      amountData,
      investedData,
      priceData,
      valueData,
    };
  }, [selectedAsset.transactions, fetchedCurrencies, dateLocale, selectedAsset.cmc_id]);

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
            const value = Number(context.parsed.y);
            const label = context.dataset.label || '';

            if (label === 'Value') return 'Portfolio Value: ' + currencyFormat(value, currencyQuote);
            if (label === 'Invested') return 'Total invested: ' + currencyFormat(value, currencyQuote);
            if (label === 'Price') return 'Price Per Unit: ' + currencyFormat(value, currencyQuote);
            return `${label}: ${value.toFixed(4)}`;
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

  const chartDataConfig: ChartData<'line'> = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Amount',
        data: chartData.amountData,
        borderColor: '#1C64F2', // blue 600
        backgroundColor: '#1A56DB', // blue 700
        yAxisID: 'y',
        stepped: 'before',
        tension: 0,
      },
      {
        label: 'Value',
        data: chartData.valueData,
        borderColor: '#10B981', // green 500
        backgroundColor: '#059669', // green 600
        yAxisID: 'y1',
        stepped: false,
        tension: 0,
      },
      {
        label: 'Invested',
        data: chartData.investedData,
        borderColor: '#EF4444', // red 500
        backgroundColor: '#DC2626', // red 600
        yAxisID: 'y1',
        stepped: false,
        tension: 0,
      },
    ],
  };

  return <Line data={chartDataConfig} options={options} />;
};

export default DetailCharts;