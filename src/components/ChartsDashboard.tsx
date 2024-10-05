// src/components/Charts.tsx

import React, { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../hooks/useReducer';
import { currentValue, currencyFormat } from '../utils/calculateHelpers';
import { getColour } from '../utils/colours';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
} from 'chart.js';
import { Pie, ChartData, ChartOptions } from 'react-chartjs-2';
import { Currency, Asset, OptionType } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  ArcElement
);

interface ChartsProps {
  data: Asset[];
  id: 'amount' | 'invested';
}

const Charts: React.FC<ChartsProps> = ({ data, id }) => {
  const { currencies } = useAppState();

  if (!currencies) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  // Convert currencies Record to array for easier access
  const currencyList: Currency[] = Object.values(currencies);

  // Define chart options
  const getChartOptions = (title: string): ChartOptions<'pie'> => ({
    plugins: {
      title: {
        display: true,
        text: title,
        color: 'white',
        font: {
          size: 20,
        },
      },
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return currencyFormat(context.parsed);
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  });

  // Define chart data based on id
  const getChartData = (): ChartData<'pie', number[], string> => {
    if (id === 'amount') {
      return {
        labels: data.map((asset) => asset.name),
        datasets: [
          {
            label: 'Total amount per asset',
            data: data.map((asset) =>
              currentValue(
                asset.totals.totalAmount,
                currencyList[asset.index].price
              )
            ),
            backgroundColor: data.map((asset) => getColour(asset.index)),
            hoverOffset: 4,
          },
        ],
      };
    }

    if (id === 'invested') {
      return {
        labels: data.map((asset) => asset.name),
        datasets: [
          {
            label: 'Total invested per asset',
            data: data.map((asset) => asset.totals.totalPurchasePrice),
            backgroundColor: data.map((asset) => getColour(asset.index)),
            hoverOffset: 4,
          },
        ],
      };
    }

    // Fallback data structure
    return {
      labels: [],
      datasets: [],
    };
  };

  // Get appropriate title based on id
  const getTitle = (): string => {
    if (id === 'amount') return 'Total amount per asset';
    if (id === 'invested') return 'Total invested per asset';
    return '';
  };

  const chartData = getChartData();
  const chartOptions = getChartOptions(getTitle());

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default Charts;
