import { useState as useGlobalState } from "../hooks/useReducer";
import { CurrentValue, CurrencyFormat } from "../utils/CalculateHelpers";

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

  const PieData = data.map((asset) =>
    CurrentValue(asset.totals.totalAmount, currencies[asset.index].price)
  );
  const PieColour = data.map((asset) => `rgb(${asset.colour})`);

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <Pie
        data={{
          labels: data.map((asset) => asset.name),
          datasets: [
            {
              label: "Holdings per asset",
              data: PieData,
              backgroundColor: PieColour,
              hoverOffset: 4,
            },
          ],
        }}
      />
    </div>
  );
};

export default Charts;
