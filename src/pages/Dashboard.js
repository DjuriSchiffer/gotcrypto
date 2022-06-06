import { useState as useGlobalState } from "../hooks/useReducer";

const Dashboard = () => {
    const { currencies } = useGlobalState();

    return (
        <ul>
            {currencies && currencies.map((currency, index) => {
                return (
                    <li
                        key={index}
                    >
                        {currency.name}
                        {currency.price}
                    </li>
                );
            })}
        </ul>
    );
};

export default Dashboard;