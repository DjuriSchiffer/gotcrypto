import { useState as useGlobalState } from "../hooks/useReducer";
import { CurrencyFormat } from "../utils/CalculateHelpers";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Charts = ({ data }) => {
  const { currencies } = useGlobalState();
  const assets = JSON.parse(JSON.stringify(data.assets)).reverse();

  const labels = assets.map((asset) => {
    const date = new Date(asset.date);
    return date.toLocaleDateString("nl", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  });
  const amount = assets.map((asset) => parseFloat(asset.amount));
  const amountData = amount.map((asset, index) =>
    amount.slice(0, index + 1).reduce((a, b) => a + b)
  );

  const options = {
    responsive: true,
    scaleFontColor: "#FFFFFF",
    interaction: {
      mode: "index",
      intersect: true,
    },

    stacked: true,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: {
          color: "white",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          color: "white",
        },
      },
      x: {
        ticks: { color: "white" },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Holdings")
              return "Holdings: " + CurrencyFormat(context.parsed.y);
          },
        },
      },
    },
  };

  return (
    <Line
      data={{
        labels: labels,
        datasets: [
          {
            label: "Amount",
            data: amountData,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            yAxisID: "y",
          },
          {
            label: "Holdings",
            data:
              currencies &&
              amountData.map((asset) => asset * currencies[data.index].price),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            yAxisID: "y1",
          },
        ],
      }}
      options={options}
    />
  );
};

export default Charts;
