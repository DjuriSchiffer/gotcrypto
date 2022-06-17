import { CurrencyFormat } from "../utils/CalculateHelpers";
import {useState as useGlobalState} from "../hooks/useReducer";
import LinkButton from "../components/LinkButton";
import OverviewTotals from "../components/OverviewTotals.jsx";

const Dashboard = () => {
    const { currencies, assets } = useGlobalState();

    return (
        <ul>
            {currencies && Object.values(currencies).map((currency, index) => {
                return (
                    <li className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10" key={index}>
                        <div className="flex items-center">
                            <LinkButton to={currency.slug}>{currency.name}</LinkButton>
                            <span className="ml-auto">Current Price: {CurrencyFormat(currency.price)}</span>
                        </div>
                        {assets && assets[currency.slug] && assets[currency.slug].length > 0 &&
                        <OverviewTotals assets={assets[currency.slug]} currentCurrency={currency}/>
                        }
                    </li>
                );
            })}
        </ul>
    );
};

export default Dashboard;