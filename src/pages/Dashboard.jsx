import { useState as useGlobalState } from "../hooks/useReducer";

const Dashboard = () => {
    const { currencies } = useGlobalState();

    return (
        <ul className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
            {currencies && currencies.map((currency, index) => {
                return (
                    <li className="text-3xl font-bold underline test"
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