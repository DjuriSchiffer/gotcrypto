import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState, useDispatch} from "../hooks/useReducer";
import LinkButton from "../components/LinkButton";
import AddButton from "../components/AddButton";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { currencies } = useGlobalState();
    const { data } = useGlobalState();
    const [currencySlug, setCurrencySlug] = useState('');

    useEffect(() => {
        if (currencySlug !== '') {
            data[currencySlug].push('test');
            dispatch({
                type: "SET_INITIAL_DATA",
                payload: data
            });
        }
    }, [currencySlug]);

    const handleAdd = useCallback((slug) => () => {
        setCurrencySlug(slug);
    }, []);

    return (
        <ul>
            {currencies && currencies.map((currency, index) => {
                return (
                    <li className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10" key={index}>
                        <LinkButton to={currency.slug}>{currency.name}</LinkButton>
                        {currency.price}
                        <AddButton onClick={handleAdd(currency.slug)}>Add asset</AddButton>
                    </li>
                );
            })}
        </ul>
    );
};

export default Dashboard;