// src/components/Charts.tsx

import React from 'react';
import { useAppState } from '../hooks/useReducer';
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
import { Currency, Asset } from '../types';

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
  const { currencies } = useAppState();

  // Deep copy and reverse the assets array to prevent mutation
  const assets: Asset[] = [...data.assets].reverse();

  // Generate labels from asset dates
  const labels: string[] = assets.map((asset) => {
    const date = new Date(asset.date);
    return date.toLocaleDateString('nl', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  });

  // Parse amounts as numbers
  const amount: number[] = assets.map((asset) =>
    parseFloat(asset.amount.toString())
  );

  // Calculate cumulative amount data
  const amountData: number[] = amount.map((asset, index) =>
    amount.slice(0, index + 1).reduce((a, b) => a + b, 0)
  );

  // Define Chart.js options with proper typing
  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: true,
    },
    stacked: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: 'white',
          callback: (value) => currencyFormat(Number(value)),
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: 'white',
          callback: (value) => currencyFormat(Number(value)),
        },
        grid: {
          drawOnChartArea: false, // Prevents y1 grid lines from being drawn on the chart area
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

  // Define Chart.js data with proper typing
  const chartData: ChartData<'line'> = {
    labels: labels,
    datasets: [
      {
        label: 'Amount',
        data: amountData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
        tension: 0.4, // Adds smooth curves to the line
      },
      {
        label: 'Holdings',
        data:
          currencies && currencies[data.index]
            ? amountData.map(
                (asset) => asset * Number(currencies[data.index].price) // Ensure price is a number
              )
            : [],
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
