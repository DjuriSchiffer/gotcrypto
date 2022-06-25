import {useState as useGlobalState} from "../hooks/useReducer";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import LinkButton from "../components/LinkButton";
import DashboardTableCell from "../components/DashboardTableCell";
import DashboardTableHead from "../components/DashboardTableHead";
import { PercentageFormat, CurrencyFormat} from '../utils/CalculateHelpers';

const Dashboard = () => {
    const { currencies, selectedCurrencies } = useGlobalState();
    const dispatch = useDispatch();
    const [inputs, setInputs] = useState({});
    const [submit, setSubmit] = useState(false)

    useEffect(() => {
        if(selectedCurrencies){
            console.log('check' ,selectedCurrencies);
        }
    }, [selectedCurrencies])

    useEffect(() => {
        if(submit && inputs){
            console.log(inputs);
            localForage.getItem('selectedCurrencies').then(data => {
                if(data.filter(e => e.name === inputs).length > 0) return

                const object = {
                    name: inputs,
                    assets : [],
                    totals: {}
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
            {selectedCurrencies && selectedCurrencies.map((selectedCurrency, index ) => {
                return (
                    <div key={index}>{selectedCurrency.name} <LinkButton to={selectedCurrency.name}>+</LinkButton></div>
                )
            })}

            {/* {currencies && assets && Object.values(currencies).map((currency, index) => {
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
                                <DashboardTableCell>{currency.name}</DashboardTableCell>
                                <DashboardTableCell>{CurrencyFormat(currency.price)}</DashboardTableCell>
                                <DashboardTableCell>
                                    {assets && assets[currency.slug] && assets[currency.slug].totals &&
                                        <div className="flex">
                                            {CurrencyFormat(assets[currency.slug].totals.totalValue)}
                                            {assets[currency.slug].totals.totalAmount}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell>
                                {assets && assets[currency.slug] && assets[currency.slug].totals &&
                                        <div className="flex">
                                            {PercentageFormat(assets[currency.slug].totals.totalPercentageDifference)}
                                        </div>
                                    }
                                </DashboardTableCell>
                                <DashboardTableCell><LinkButton to={currency.slug}>+</LinkButton></DashboardTableCell>
                            </tr>
                        </tbody>
                    </table>
                );
            })} */}
        </>
    );
};

export default Dashboard;