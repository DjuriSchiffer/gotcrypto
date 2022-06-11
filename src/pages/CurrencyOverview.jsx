import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import AddButton from "../components/AddButton";
import localForage from "localforage";
import { useParams } from 'react-router-dom';

const CurrencyOverview = () => {
    const { currencies } = useGlobalState();
    const { overviewSlug } = useParams();
    const [assets, setAssets] = useState([]);
    const [currentCurrency, setCurrentCurrency ] = useState({});

    useEffect(() => {
        if (currencies !== null) {
            setCurrentCurrency(currencies[overviewSlug]);
        }
    }, [currencies]);


    useEffect(() => {
        if(currentCurrency !== undefined){
            localForage.getItem(overviewSlug)
                .then(val => {
                    setAssets(val);
                });
        }

    }, [overviewSlug]);


    return (
        <ul>
            <li className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
                {currentCurrency.name}
                {currentCurrency.price}
                {assets && assets.map((asset, index) =>  {
                    return (
                        <li key={index}>Test</li>
                    )
                } )}
            </li>
        </ul>
    );
};

export default CurrencyOverview;