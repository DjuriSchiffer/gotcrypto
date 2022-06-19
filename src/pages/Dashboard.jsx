import {useState as useGlobalState} from "../hooks/useReducer";
import LinkButton from "../components/LinkButton";
import DashboardTableCell from "../components/DashboardTableCell";
import DashboardTableHead from "../components/DashboardTableHead";
import { PercentageFormat, CurrencyFormat} from '../utils/CalculateHelpers';

const Dashboard = () => {
    const { currencies, assets } = useGlobalState();

    return (
        <>
            {currencies && assets && Object.values(currencies).map((currency, index) => {
                return (
                    <table key={index} className="container mx-auto bg-gray-200 shadow border p-8 m-10" >
                        <DashboardTableHead>
                            <tr>
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Current Price</th>
                                <th className="text-left py-2">Holdings</th>
                                <th className="text-left py-2">Profit/loss</th>
                                <th className="text-right py-2">Actions</th>     
                            </tr>   
                        </DashboardTableHead>
                        <tbody>
                            <tr>
                                <DashboardTableCell>{currency.name}</DashboardTableCell>
                                <DashboardTableCell>{CurrencyFormat(currency.price)}</DashboardTableCell>
                                <DashboardTableCell>
                                    {assets && assets[currency.slug] && assets[currency.slug].totals &&
                                        <div className="flex">
                                            {CurrencyFormat(assets[currency.slug].totals.totalValue)}
                                            {assets[currency.slug].totals.totalAmount}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell>
                                {assets && assets[currency.slug] && assets[currency.slug].totals &&
                                        <div className="flex">
                                            {PercentageFormat(assets[currency.slug].totals.totalPercentageDifference)}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell><LinkButton to={currency.slug}>+</LinkButton></DashboardTableCell>
                            </tr>
                        </tbody>
                    </table>
                );
            })}
        </>
    );
};

export default Dashboard;