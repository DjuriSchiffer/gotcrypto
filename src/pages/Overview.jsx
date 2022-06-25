import { useEffect, useState, useCallback } from "react";
import {useState as useGlobalState} from "../hooks/useReducer";
import Button from "../components/Button";
import OverviewHeader from "../components/OverviewHeader"
import OverviewRow from "../components/OverviewRow"
import OverviewTotals from "../components/OverviewTotals"
import LinkButton from "../components/LinkButton";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import { useParams } from 'react-router-dom';
import totals from "../utils/totals"
import _ from "lodash"

const Overview = () => {
    const { currencies } = useGlobalState();
    const dispatch = useDispatch();
    const { overviewSlug } = useParams();
    const [currentCurrency, setCurrentCurrency ] = useState({});
    const [currentSelectedCurrency, setCurrentSelectedCurrency ] = useState({});
    const [inputs, setInputs] = useState({});
    const [submit, setSubmit] = useState(false);
    const setSelectedCurrencyData = (data, currIndex) => {
        localForage.setItem('selectedCurrencies', data).then((data => {
            dispatch({
                type: "SET_SELECTED_CURRENCIES",
                payload: data
            });
            setCurrentSelectedCurrency(data[currIndex]);
        })).catch(function(err) {
            // This code runs if there were any errors
            console.log(err)
            dispatch({
                type: "SET_ERROR",
                payload: err
            });
        });
    }

    useEffect(() => {
        if (currencies !== null) {
            const currIndex = currencies.findIndex(
                (e) => {
                    if(e && e.name === overviewSlug) {
                        return e
                    }
                }
              );
            setCurrentCurrency(currencies[currIndex]);
        }
    }, [currencies, overviewSlug]);

    useEffect(() => {
        if (overviewSlug) {            
            localForage.getItem('selectedCurrencies')
                .then(data => {
                    setCurrentSelectedCurrency(data.find(e => e.name === overviewSlug));
                }).catch(function(err) {
                    console.log(err)
                // This code runs if there were any errors
                dispatch({type: "SET_ERROR"});
            });
        }
    }, [overviewSlug]);

    useEffect(() => {
        if(submit){
           localForage.getItem('selectedCurrencies').then(data => {
                 const currIndex = data.findIndex(
                    (e) => e.name === currentCurrency.name
                  );
                data[currIndex].assets.push(inputs);
                data[currIndex].totals = totals(data[currIndex].assets, currentCurrency);
                setSelectedCurrencyData(data, currIndex);
            }).catch(function(err) {
                console.log(err)
            // This code runs if there were any errors
            dispatch({type: "SET_ERROR"});
        });

        }
        setSubmit(false);
    }, [submit, inputs, currentCurrency])

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({
            ...values, 
            [name]: name === 'date' ? new Date(value) : value,
            id : _.uniqueId()
        }))
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmit(true);
        event.target.reset();
    };

    const handleRemoveAsset = useCallback((asset) => {
        localForage.getItem('selectedCurrencies').then(data => {
            const currIndex = data.findIndex(
                (e) => e.name === overviewSlug
              );

            data[currIndex].assets = data[currIndex].assets.filter(item => item.id !== asset.id);
            data[currIndex].totals = totals(data[currIndex].assets, currentCurrency);
            setSelectedCurrencyData(data, currIndex);
        });   
    }, [overviewSlug]);

    const handleRemoveAllAssets = useCallback((overviewSlug) => {
        localForage.getItem('selectedCurrencies').then(data => {
            const currIndex = data.findIndex(
                (e) => e.name === overviewSlug
              );
            data[currIndex].assets = [];           
            data[currIndex].totals = totals(data[currIndex].assets, currentCurrency);
            setSelectedCurrencyData(data, currIndex);
        });  
    }, [overviewSlug]);

    return (
        <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
            <OverviewHeader onSubmit={handleSubmit}>
                <LinkButton to="/">Return to dashboard</LinkButton>
                {currentCurrency && 
                    <div>{currentCurrency.name} {currentCurrency.price}</div>
                }
                <input name="amount" type="number" placeholder="amount" onChange={handleChange} required/>
                <input name="purchasePrice" type="number" placeholder="purchase price" onChange={handleChange}
                       required/>
                <input name="date" type="date" placeholder="date" onChange={handleChange} required/>
                <input className="bg-green-800 p-2 rounded-md shadow text-white" type="submit" value="add asset"/>
                <Button onClick={() => handleRemoveAllAssets(overviewSlug)}>Remove all assets</Button>
            </OverviewHeader>
            {currentCurrency && currentSelectedCurrency && currentSelectedCurrency?.assets && currentSelectedCurrency.assets.map((asset, index) => {
                return (
                    <OverviewRow key={index} asset={asset} currentCurrency={currentCurrency}>
                        <Button onClick={() => handleRemoveAsset(asset)}>Remove asset</Button>
                    </OverviewRow>
                )
            })}
            {currentCurrency && currentSelectedCurrency && currentSelectedCurrency?.totals &&
                <OverviewTotals totals={currentSelectedCurrency.totals} currentCurrency={currentCurrency}/>
            }
        </div>
    );
};

export default Overview;