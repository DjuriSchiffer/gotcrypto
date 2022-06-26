import {useState as useGlobalState} from "../hooks/useReducer";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import LinkButton from "../components/LinkButton";
import Button from "../components/Button";
import DashboardTableCell from "../components/DashboardTableCell";
import DashboardTableHead from "../components/DashboardTableHead";
import { PercentageFormat, CurrencyFormat} from '../utils/CalculateHelpers';
import _ from "lodash"
import totals from "../utils/totals";

const Dashboard = () => {
    const { currencies, selectedCurrencies } = useGlobalState();
    const dispatch = useDispatch();
    const [inputs, setInputs] = useState({});
    const [submit, setSubmit] = useState(false)

    useEffect(() => {
        if(submit && inputs){
            localForage.getItem('selectedCurrencies').then(data => {
                if(data.filter(item => item.name === inputs).length > 0) return;
                const currIndex = currencies.findIndex((item) => {
                    if(item && item.name === inputs) {
                        return item
                    }
                });

                const object = {
                    name: inputs,
                    index: currIndex,
                    assets : [],
                    totals: totals([], currencies[currIndex])
                }
                data.push(object);
                localForage.setItem('selectedCurrencies', data).then(data => {
                    dispatch({
                        type: "SET_SELECTED_CURRENCIES",
                        payload: data
                    });
                });
                
            }).catch(function(err) {
                // This code runs if there were any errors
                dispatch({
                    type: "SET_ERROR",
                    payload: err
                });
            })
        }
        setSubmit(false);
    }, [submit, inputs])

    const handleChange = (event) => {
        setInputs(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmit(true);

        event.target.reset();
    };

    const handleRemoveCurrency = (selectedCurrency) => {
        localForage.getItem('selectedCurrencies').then(data => {
            data = data.filter( item => !_.isEqual(item, selectedCurrency));
            localForage.setItem('selectedCurrencies', data).then((data => {
                dispatch({
                    type: "SET_SELECTED_CURRENCIES",
                    payload: data
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
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <select onChange={handleChange}>
                    <option value="" key="0">Select currency:</option>  
                    {currencies && currencies.map( (currency, i) => {
                        return (
                            <option value={currency.name} key={i}>{currency.slug}</option>
                        )
                    })}
                </select>
                <input className="bg-green-800 p-2 rounded-md shadow text-white" type="submit" value="add asset"/>
            </form>
            {currencies && selectedCurrencies && selectedCurrencies.map((selectedCurrency, index ) => {
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
                                <DashboardTableCell>{selectedCurrency.name}</DashboardTableCell>
                                <DashboardTableCell>{CurrencyFormat(currencies[selectedCurrency.index].price)}</DashboardTableCell>
                                <DashboardTableCell>
                                    {selectedCurrency.totals &&
                                        <div className="flex">
                                            {CurrencyFormat(selectedCurrency.totals.totalValue)}
                                            {selectedCurrency.totals.totalAmount}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell>
                                    {selectedCurrency.totals &&
                                        <div className="flex">
                                            {PercentageFormat(selectedCurrency.totals.totalPercentageDifference)}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell>
                                    <LinkButton to={selectedCurrency.name}>+</LinkButton>
                                    <Button onClick={() => handleRemoveCurrency(selectedCurrency)}>-</Button>
                                </DashboardTableCell>
                            </tr>
                        </tbody>
                    </table>
                )
            })}
        </>
    );
};

export default Dashboard;