import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import Button from "../components/Button";
import OverviewHeader from "../components/OverviewHeader"
import OverviewRow from "../components/OverviewRow"
import OverviewTotals from "../components/OverviewTotals"
import localForage from "localforage";
import { useParams } from 'react-router-dom';

const Overview = () => {
    const { currencies } = useGlobalState();
    const { overviewSlug } = useParams();
    const [assets, setAssets] = useState([]);
    const [currentCurrency, setCurrentCurrency ] = useState({});
    const [inputs, setInputs] = useState({});


    useEffect(() => {
        if (currencies !== null) {
            setCurrentCurrency(currencies[overviewSlug]);
        }
    }, [currencies]);


    useEffect(() => {
        if (currentCurrency !== undefined) {
            localForage.getItem(overviewSlug)
                .then(val => {
                    setAssets(val);
                });
        }

    }, [overviewSlug]);


    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        localForage.getItem(overviewSlug)
            .then(val => {
                val.push(inputs);
                localForage.setItem(overviewSlug, val).then((val => {
                    setAssets(val);
                }));
            });

        event.target.reset();
    };

    const handleRemoveAsset = useCallback((asset) => {
        localForage.setItem(overviewSlug, assets.filter(item => item !== asset)).then((val => {
            setAssets(val);
        }));
    }, [assets]);

    return (
        <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
            {currentCurrency.name}
            {currentCurrency.price}
            <OverviewHeader onSubmit={handleSubmit}>
                <input name="amount" type="number" placeholder="amount" onChange={handleChange} required/>
                <input name="purchasePrice" type="number" placeholder="purchase price" onChange={handleChange}
                       required/>
                <input name="date" type="date" placeholder="date" onChange={handleChange} required/>
                <input type="submit" value="add asset"/>
            </OverviewHeader>
            {assets && assets.map((asset, index) => {
                return (
                    <OverviewRow key={index} asset={asset} currentCurrency={currentCurrency}>
                        <Button onClick={() => handleRemoveAsset(asset)}>Remove asset</Button>
                    </OverviewRow>
                )
            })}
            {assets.length > 0 &&
                <OverviewTotals assets={assets} currentCurrency={currentCurrency}/>
            }
        </div>
    );
};

export default Overview;