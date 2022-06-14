import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import Button from "../components/Button";
import OverviewHeader from "../components/OverviewHeader"
import OverviewRow from "../components/OverviewRow"
import OverviewTotals from "../components/OverviewTotals"
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import { useParams } from 'react-router-dom';

const Overview = () => {
    const { currencies, assets } = useGlobalState();
    const dispatch = useDispatch();
    const { overviewSlug } = useParams();
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
                .then(data => {
                    assets[overviewSlug] = data;
                    dispatch({
                        type: "SET_ASSETS",
                        payload: assets
                    });
                }).catch(function(err) {
                // This code runs if there were any errors
                dispatch({type: "SET_ERROR"});
            });
        }
    }, [overviewSlug]);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: name === 'date' ? new Date(value) : value}))
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        localForage.getItem(overviewSlug)
            .then(data => {
                data.push(inputs);
                localForage.setItem(overviewSlug, data.sort((a, b) => a.date - b.date)).then((data => {
                    assets[overviewSlug] = data;
                    dispatch({
                        type: "SET_ASSETS",
                        payload: assets
                    });
                })).catch(function(err) {
                    // This code runs if there were any errors
                    dispatch({
                        type: "SET_ERROR",
                        payload: err
                    });
                });
            });

        event.target.reset();
    };

    const handleRemoveAsset = useCallback((asset) => {
        localForage.setItem(overviewSlug, assets[overviewSlug].filter(item => item !== asset)).then((data => {
            assets[overviewSlug] = data;
            dispatch({
                type: "SET_ASSETS",
                payload: assets
            });
        })).catch(function(err) {
            // This code runs if there were any errors
            dispatch({
                type: "SET_ERROR",
                payload: err
            });
        });
    }, [assets]);

    const handleRemoveAllAssets = useCallback((assets) => {
        localForage.setItem(overviewSlug, []).then((data => {
            assets[overviewSlug] = [];
            dispatch({
                type: "SET_ASSETS",
                payload: assets
            });
        })).catch(function(err) {
            // This code runs if there were any errors
            dispatch({
                type: "SET_ERROR",
                payload: err
            });
        });
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
                <Button onClick={() => handleRemoveAllAssets(assets)}>Remove all assets</Button>
            </OverviewHeader>
            {assets[currentCurrency.slug] && assets[currentCurrency.slug].map((asset, index) => {
                return (
                    <OverviewRow key={index} asset={asset} currentCurrency={currentCurrency}>
                        <Button onClick={() => handleRemoveAsset(asset)}>Remove asset</Button>
                    </OverviewRow>
                )
            })}
            {assets[currentCurrency.slug] && assets[currentCurrency.slug].length > 0 &&
                <OverviewTotals assets={assets[currentCurrency.slug]} currentCurrency={currentCurrency}/>
            }
        </div>
    );
};

export default Overview;