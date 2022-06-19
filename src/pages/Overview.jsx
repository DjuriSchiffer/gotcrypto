import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import Button from "../components/Button";
import OverviewHeader from "../components/OverviewHeader"
import OverviewRow from "../components/OverviewRow"
import LinkButton from "../components/LinkButton";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import { useParams } from 'react-router-dom';
import totals from "../utils/totals"

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
        if (overviewSlug !== null && currentCurrency !== undefined) {            
            localForage.getItem(overviewSlug)
                .then(data => {
                    assets[overviewSlug].assets = data.assets;
                    assets.totals = totals(data.assets, currentCurrency);
                    dispatch({
                        type: "SET_ASSETS",
                        payload: assets
                    });
                }).catch(function(err) {
                    console.log(err)
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
                data.assets.push(inputs);
                assets[overviewSlug].assets = data.assets
                assets[overviewSlug].totals = totals(data.assets, currentCurrency);

                localForage.setItem(overviewSlug, assets[overviewSlug]).then((data => {
                    dispatch({
                        type: "SET_ASSETS",
                        payload: assets
                    });
                })).catch(function(err) {
                    // This code runs if there were any errors
                    console.log(err)
                    dispatch({
                        type: "SET_ERROR",
                        payload: err
                    });
                });
            });

        event.target.reset();
    };

    const handleRemoveAsset = useCallback((asset) => {
        localForage.getItem(overviewSlug)
            .then(data => {
                assets[overviewSlug].assets = assets[overviewSlug].assets.filter(item => item !== asset);
                assets[overviewSlug].totals = totals(assets[overviewSlug].assets, currentCurrency);

                localForage.setItem(overviewSlug, assets[overviewSlug]).then((data => {
                    dispatch({
                        type: "SET_ASSETS",
                        payload: assets
                    });
                })).catch(function(err) {
                    // This code runs if there were any errors
                    console.log(err)
                    dispatch({
                        type: "SET_ERROR",
                        payload: err
                    });
                });
            });   
    }, [assets]);

    const handleRemoveAllAssets = useCallback((overviewSlug) => {
        localForage.getItem(overviewSlug)
        .then(data => {
            assets[overviewSlug].assets = [];
            assets[overviewSlug].totals = totals([], currentCurrency);

            localForage.setItem(overviewSlug, assets[overviewSlug]).then((data => {
                dispatch({
                    type: "SET_ASSETS",
                    payload: assets
                });
            })).catch(function(err) {
                // This code runs if there were any errors
                console.log(err)
                dispatch({
                    type: "SET_ERROR",
                    payload: err
                });
            });
        });  
    }, [overviewSlug]);

    return (
        <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
            <LinkButton to="/">Return to dashboard</LinkButton>
            {currentCurrency.name}
            {currentCurrency.price}
            <OverviewHeader onSubmit={handleSubmit}>
                <input name="amount" type="number" placeholder="amount" onChange={handleChange} required/>
                <input name="purchasePrice" type="number" placeholder="purchase price" onChange={handleChange}
                       required/>
                <input name="date" type="date" placeholder="date" onChange={handleChange} required/>
                <input className="bg-green-800 p-2 rounded-md shadow text-white" type="submit" value="add asset"/>
                <Button onClick={() => handleRemoveAllAssets(overviewSlug)}>Remove all assets</Button>
            </OverviewHeader>
            {assets && currentCurrency && assets[currentCurrency.slug]?.assets && assets[currentCurrency.slug].assets.map((asset, index) => {
                return (
                    <OverviewRow key={index} asset={asset} currentCurrency={currentCurrency}>
                        <Button onClick={() => handleRemoveAsset(asset)}>Remove asset</Button>
                    </OverviewRow>
                )
            })}
        </div>
    );
};

export default Overview;