import React from 'react';
import { currencyFormat } from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FetchedCurrency, SelectedAsset } from '../types/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsProps {
  assetMap: Map<number, SelectedAsset>;
  fetchedCurrencies?: FetchedCurrency[];
  selectedAssets: SelectedAsset[];
  id: 'amount' | 'invested';
}

const Charts: React.FC<ChartsProps> = ({ assetMap, fetchedCurrencies, selectedAssets, id }) => {
  const getChartOptions = (title: string): ChartOptions<'bar'> => ({
    indexAxis: 'y' as const,
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
        display: false,
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
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        ticks: {
          color: 'white',
          callback: function (value) {
            return currencyFormat(value as number);
          }
        }
      },
      y: {
        grid: {
          display: true
        },
        ticks: {
          color: 'white',
          padding: 0,
          font: {
            size: 12
          }
        }
      }
    }
  });

  const getChartData = (): ChartData<'bar', number[], string> => {
    if (id === 'amount') {
      const dataPoints = selectedAssets.map((selectedAsset) => {
        const currentCurrency = fetchedCurrencies?.find(
          (fetchedCurrency) => fetchedCurrency.cmc_id === selectedAsset.cmc_id
        );
        const currentPrice = currentCurrency?.price ?? 0;
        const value = currentPrice * selectedAsset.totals.totalAmount || 0;

        return {
          value,
          label: selectedAsset.name
        };
      });

      const sortedData = dataPoints.sort((a, b) => b.value - a.value);

      return {
        labels: sortedData.map(item => item.label),
        datasets: [{
          data: sortedData.map(item => item.value),
          backgroundColor: 'rgba(16, 185, 129, 1)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 20,  // Control maximum thickness
          categoryPercentage: 0.8, // Control the width of the bar relative to the category
          barPercentage: 0.9 // Control the space between bars
        }]
      };
    }

    if (id === 'invested') {
      // Create array of [value, label] pairs for sorting
      const dataPoints = selectedAssets.map(selectedAsset => ({
        value: selectedAsset.totals.totalPurchasePrice,
        label: selectedAsset.name
      }));

      // Sort by value in descending order
      const sortedData = dataPoints.sort((a, b) => b.value - a.value);

      return {
        labels: sortedData.map(item => item.label),
        datasets: [{
          data: sortedData.map(item => item.value),
          backgroundColor: 'rgba(16, 185, 129, 1)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 20,  // Control maximum thickness
          categoryPercentage: 0.8, // Control the width of the bar relative to the category
          barPercentage: 0.9 // Control the space between bars
        }]
      };
    }

    return {
      labels: [],
      datasets: []
    };
  };

  const getTitle = (): string => {
    if (id === 'amount') return 'Total value per asset';
    if (id === 'invested') return 'Total amount invested per asset';
    return '';
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