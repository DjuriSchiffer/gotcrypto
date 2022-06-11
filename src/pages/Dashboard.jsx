import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import LinkButton from "../components/LinkButton";

const Dashboard = () => {
    const { currencies } = useGlobalState();

    return (
        <ul>
            {currencies && Object.values(currencies).map((currency, index) => {
                return (
                    <li className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10" key={index}>
                        <LinkButton to={currency.slug}>{currency.name}</LinkButton>
                        {currency.price}
                    </li>
                );
            })}
        </ul>
    );
};

export default Dashboard;