import {useState as useGlobalState} from "../hooks/useReducer";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import LinkButton from "../components/LinkButton";
import Button from "../components/Button";
import DashboardTableCell from "../components/DashboardTableCell";
import DashboardTableHead from "../components/DashboardTableHead";
import { PercentageFormat, CurrencyFormat} from '../utils/CalculateHelpers';
import isEqual from "lodash.isequal"
import totals from "../utils/totals";
import Select from 'react-select'

const Dashboard = () => {
    const { currencies, selectedCurrencies } = useGlobalState();
    const dispatch = useDispatch();
    const [input, setInput] = useState({});
    const [submit, setSubmit] = useState(false);
    const [options, setOptions] = useState([]);
    const defaultValue = {
        label: "Select currency", value: null
    }
    const selectInputRef = useRef();

    useEffect(() => {
        if(submit && input && input.value !== null){
            localForage.getItem('selectedCurrencies').then(data => {
                if(data.filter(item => item.name === input.value).length > 0) return;
                const currIndex = currencies.findIndex((item) => {
                    if(item && item.name === input.value) {
                        return item
                    }
                });
                const object = {
                    name: input.value,
                    label: input.label,
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
                selectInputRef.current.setValue(defaultValue);
        
            }).catch(function(err) {
                // This code runs if there were any errors
                dispatch({
                    type: "SET_ERROR",
                    payload: err
                });
            })
        }
        setSubmit(false);

    }, [submit, input]);

    useEffect(() => {
        if(currencies !== null && selectedCurrencies){
            let optionsArr = [];
            currencies.map((currency, i) => {
                let isDisabled = false;
                selectedCurrencies.forEach(element => {
                    if(element.name === currency.name){
                        isDisabled =  true;
                    } 
                });

                optionsArr.push({
                    value: currency.name,
                    label: currency.slug,
                    disabled: isDisabled
                });
            });
            setOptions(optionsArr);
        }
    }, [currencies, selectedCurrencies]);


    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmit(true);
    };

    const handleRemoveCurrency = (selectedCurrency) => {
        localForage.getItem('selectedCurrencies').then(data => {
            data = data.filter( item => !isEqual(item, selectedCurrency));
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

    const handleOrderCurrencyUp = (selectedCurrency) => {
        localForage.getItem('selectedCurrencies').then(data => {
            const currIndex = data.findIndex((item) => {
                if(item && item.name === selectedCurrency.name) {
                    return item
                }
            });
            const toIndex = currIndex - 1;
            const element = data.splice(currIndex, 1)[0];
            data.splice(toIndex, 0, element);

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

    const handleOrderCurrencyDown = (selectedCurrency) => {
        localForage.getItem('selectedCurrencies').then(data => {
            const currIndex = data.findIndex((item) => {
                if(item && item.name === selectedCurrency.name) {
                    return item
                }
            });
            const toIndex = currIndex + 1;
            const element = data.splice(currIndex, 1)[0];
            data.splice(toIndex, 0, element);

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
                <Select ref={selectInputRef} setValue={input} defaultValue={defaultValue} onChange={setInput} options={options} isOptionDisabled={(option) => option.disabled}/>                    
                <input className="bg-green-800 p-2 rounded-md shadow text-white" type="submit" value="add asset"/>
            </form>
            <table className="container mx-auto bg-gray-200 shadow border p-8 m-10" >
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
                {currencies && selectedCurrencies && selectedCurrencies.map((selectedCurrency, index ) => {
                return ( 
                    <tr key={index}>
                        <DashboardTableCell>{selectedCurrency.label}</DashboardTableCell>
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
                        <DashboardTableCell align={"right"}>
                            <LinkButton to={selectedCurrency.name}>Add assets</LinkButton>
                            {index > 0 && <Button onClick={() => handleOrderCurrencyUp(selectedCurrency)}>Up</Button> }
                            {index + 1 < selectedCurrencies.length && <Button onClick={() => handleOrderCurrencyDown(selectedCurrency)}>Down</Button> } 
                            <Button onClick={() => handleRemoveCurrency(selectedCurrency)}>Remove Currency</Button>
                        </DashboardTableCell>
                    </tr>
                    )
                })}
                </tbody>
            </table>
        </>
    );
};

export default Dashboard;