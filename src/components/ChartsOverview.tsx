import React from 'react';
import { useAppState } from '../hooks/useAppState';
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
import { Asset, SelectedCurrency } from 'currency';
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

interface ChartsProps {
  data: {
    assets: Asset[];
    index: number;
  };
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  const { fetchedCurrencies } = useAppState();
  const { selectedCurrencies } = useStorage();

  const selectedCurrency: SelectedCurrency | undefined =
    selectedCurrencies[data.index];

  if (!selectedCurrency) {
    return <div>No currency selected.</div>;
  }

  const cmc_id = selectedCurrency.cmc_id;

  const assets: Asset[] = [...data.assets].reverse();

  const labels: string[] = assets.map((asset) => {
    const date = new Date(asset.date);
    return date.toLocaleDateString('nl', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  });

  const amount: number[] = assets.map((asset) => parseFloat(asset.amount));

  const amountData: number[] = amount.map((asset, index) =>
    amount.slice(0, index + 1).reduce((a, b) => a + b, 0)
  );

  const currencyPrice = fetchedCurrencies
    ? fetchedCurrencies[cmc_id]?.price
    : 0;

  const holdingsData: number[] = amountData.map(
    (cumulativeAmount) => cumulativeAmount * currencyPrice
  );

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
          color: 'rgb(53, 162, 235)',
          callback: (value) => Number(value),
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: 'rgb(255, 99, 132)',
          callback: (value) => currencyFormat(Number(value)),
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
              return 'Holdings: ' + currencyFormat(Number(context.parsed.y));
            }
            return `${context.dataset.label}: ${currencyFormat(
              Number(context.parsed.y)
            )}`;
          },
        },
      },
      title: {
        display: true,
        text: 'Asset Overview',
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
        tension: 0.4,
      },
      {
        label: 'Holdings',
        data: holdingsData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  return <Line data={chartData} options={options} />;
};

export default Charts;
