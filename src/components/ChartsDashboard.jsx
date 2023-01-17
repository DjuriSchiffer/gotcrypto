import { useState as useGlobalState } from "../hooks/useReducer";
import { CurrentValue, CurrencyFormat } from "../utils/CalculateHelpers";
import { getColour } from "../utils/colours";

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
import { Pie } from "react-chartjs-2";

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

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Total amount per asset",
        color: "white",
      },
      legend: {
        labels: {
          color: "white",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return CurrencyFormat(context.parsed);
          },
        },
      },
    },
  };

  return (
    <div className="max-w-sm p-3 shadow-line">
      <Pie
        data={{
          labels: data.map((asset) => asset.name),
          datasets: [
            {
              label: "Total amount per asset",
              data: data.map((asset) =>
                CurrentValue(
                  asset.totals.totalAmount,
                  currencies[asset.index].price
                )
              ),
              backgroundColor: data.map((asset) => getColour(asset.index)),
              hoverOffset: 2,
            },
          ],
        }}
        options={options}
      />
    </div>
  );
};

export default Charts;
