import type {
  ChartData,
  ChartOptions
} from 'chart.js';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import type { FetchedCurrency, SelectedAsset } from '../types/currency';

import { currencyFormat } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ChartsProps = {
  assetMap: Map<number, SelectedAsset>;
  fetchedCurrencies?: Array<FetchedCurrency>;
  id: 'amount' | 'invested';
  selectedAssets: Array<SelectedAsset>;
}

function Charts({ fetchedCurrencies, id, selectedAssets }: ChartsProps) {
  const getChartOptions = (title: string): ChartOptions<'bar'> => ({
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        color: 'white',
        display: true,
        font: {
          size: 20,
        },
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return currencyFormat(context.parsed.x);
          }
        }
      }
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        ticks: {
          callback: function (value) {
            return currencyFormat(value as number);
          },
          color: 'white'
        }
      },
      y: {
        grid: {
          display: true
        },
        ticks: {
          color: 'white',
          font: {
            size: 12
          },
          padding: 0
        }
      }
    }
  });

  const getChartData = (): ChartData<'bar', Array<number>, string> => {
    if (id === 'amount') {
      const dataPoints = selectedAssets.map((selectedAsset) => {
        const currentCurrency = fetchedCurrencies?.find(
          (fetchedCurrency) => fetchedCurrency.cmc_id === selectedAsset.cmc_id
        );
        const currentPrice = currentCurrency?.price ?? 0;
        const value = currentPrice * selectedAsset.totals.totalAmount || 0;

        return {
          label: selectedAsset.name,
          value
        };
      });

      const sortedData = dataPoints.sort((a, b) => b.value - a.value);

      return {
        datasets: [{
          backgroundColor: 'rgba(16, 185, 129, 1)',
          barPercentage: 0.9, // Control the space between bars
          borderColor: 'rgba(16, 185, 129, 1)',
          borderRadius: 4,
          borderWidth: 1,
          categoryPercentage: 0.8, // Control the width of the bar relative to the category
          data: sortedData.map(item => item.value),
          maxBarThickness: 20  // Control maximum thickness
        }],
        labels: sortedData.map(item => item.label)
      };
    } else {
      const dataPoints = selectedAssets.map(selectedAsset => ({
        label: selectedAsset.name,
        value: selectedAsset.totals.totalInvested
      }));

      const sortedData = dataPoints.sort((a, b) => b.value - a.value);

      return {
        datasets: [{
          backgroundColor: 'rgba(16, 185, 129, 1)',
          barPercentage: 0.9, // Control the space between bars
          borderColor: 'rgba(16, 185, 129, 1)',
          borderRadius: 4,
          borderWidth: 1,
          categoryPercentage: 0.8, // Control the width of the bar relative to the category
          data: sortedData.map(item => item.value),
          maxBarThickness: 20  // Control maximum thickness
        }],
        labels: sortedData.map(item => item.label)
      };
    }
  };

  const getTitle = (): string => {
    if (id === 'amount') {
      return 'Total value per asset';
    } else {
      return 'Total amount invested per asset';
    }
  };

  const chartData = getChartData();
  const chartOptions = getChartOptions(getTitle());

  return (
    <div className="h-[400px] w-full">
      <Bar
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
};

export default Charts;