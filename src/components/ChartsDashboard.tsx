import React from 'react';
import { useAppState } from '../hooks/useAppState';
import { currentValue, currencyFormat } from '../utils/helpers';

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
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FetchedCurrency, SelectedAsset } from '../types/currency';

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
  data: SelectedAsset[];
  id: 'amount' | 'invested';
}

const Charts: React.FC<ChartsProps> = ({ data, id }) => {
  const { fetchedCurrencies } = useAppState();

  if (!fetchedCurrencies) {
    return <div>Loading...</div>;
  }

  const currencyList: FetchedCurrency[] = Object.values(fetchedCurrencies);

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

  const getChartData = (): ChartData<'pie', number[], string> => {
    if (id === 'amount') {
      return {
        labels: data.map((transaction) => transaction.name),
        datasets: [
          {
            label: 'Total amount per transaction',
            data: data.map((transaction) =>
              currentValue(
                transaction.totals.totalAmount,
                currencyList[transaction.index].price
              )
            ),
            backgroundColor: data.map((transaction) => getColour(transaction.cmc_id)),
            hoverOffset: 4,
          },
        ],
      };
    }

    if (id === 'invested') {
      return {
        labels: data.map((transaction) => transaction.name),
        datasets: [
          {
            label: 'Total invested per transaction',
            data: data.map((transaction) => transaction.totals.totalPurchasePrice),
            backgroundColor: data.map((transaction) => getColour(transaction.cmc_id)),
            hoverOffset: 4,
          },
        ],
      };
    }

    return {
      labels: [],
      datasets: [],
    };
  };

  const getTitle = (): string => {
    if (id === 'amount') return 'Total amount per transaction';
    if (id === 'invested') return 'Total invested per transaction';
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
