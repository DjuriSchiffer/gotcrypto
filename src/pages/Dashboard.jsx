import {useState as useGlobalState} from "../hooks/useReducer";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import IconButton from "../components/IconButton";
import Icon from "../components/Icon";
import DashboardTableCell from "../components/DashboardTableCell";
import DashboardTableHead from "../components/DashboardTableHead";
import { PercentageFormat, CurrencyFormat} from '../utils/CalculateHelpers';
import isEqual from "lodash.isequal"
import totals, { getGlobalTotals  } from "../utils/totals";
import Select from 'react-select';
import classNames from 'classnames';

const Dashboard = () => {
    const { currencies, selectedCurrencies, globalTotals } = useGlobalState();
    const dispatch = useDispatch();
    const [input, setInput] = useState({});
    const [submit, setSubmit] = useState(false);
    const [options, setOptions] = useState([]);
    const defaultValue = {
        label: "Select currency", value: null
    }
    const selectInputRef = useRef();

    useEffect(() => {
        dispatch({
            type: "SET_GLOBAL_TOTALS",
            payload: getGlobalTotals(selectedCurrencies)
        });
    }, [selectedCurrencies, dispatch])

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
                    image: `https://s2.coinmarketcap.com/static/img/coins/32x32/${currency.cmc_id}.png`,
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
        <div className="bg-gray-dark p-8 min-h-screen">
            <div className="container mx-auto bg-gray-dark shadow m-10 flex items-center">
            {globalTotals && 
                <div>
                    <div className="text-4xl">{CurrencyFormat(globalTotals.totalValue)}</div>
                    <div className={classNames('text-xl', {
                                'text-green' : globalTotals.totalPercentageDifference  > 0,
                                'text-red' : globalTotals.totalPercentageDifference  < 0,
                            })}>
                                {PercentageFormat(globalTotals.totalPercentageDifference)}
                    </div>
                </div>
                     
            }
            <form onSubmit={handleSubmit} className="flex ml-auto">
                <Select ref={selectInputRef} setValue={input} defaultValue={defaultValue} onChange={setInput} options={options} isOptionDisabled={(option) => option.disabled} formatOptionLabel={item => (
                    <div className="flex items-center">
                        {item.image && 
                            <img width={32} height={32} src={item.image}/>
                        }
                        <span className="text-black ml-2">{item.label}</span>
                    </div>
            )}/>                    
                <input className="bg-green p-2 rounded-md shadow text-white ml-2" type="submit" value="add new"/>
            </form>
            </div>
            <table className="container mx-auto bg-gray-dark shadow border p-8 m-10" >
                <DashboardTableHead>
                    <tr>
                        <th className="text-left py-2 pl-3">Name</th>
                        <th className="text-left py-2">Current Price</th>
                        <th className="text-left py-2">Holdings</th>
                        <th className="text-left py-2">Profit/loss</th>
                        <th className="text-right py-2 pr-3">Actions</th>     
                    </tr>   
                </DashboardTableHead>
                <tbody>
                {currencies && selectedCurrencies && selectedCurrencies.map((selectedCurrency, index ) => {
                return ( 
                    <tr key={index}>
                        <DashboardTableCell position={"first"}>
                            <div className="flex items-center">
                                <img width={32} height={32} src={`https://s2.coinmarketcap.com/static/img/coins/32x32/${currencies[selectedCurrency.index].cmc_id}.png`} /> 
                                <div className="pl-2">{selectedCurrency.label}</div>
                            </div>
                        </DashboardTableCell>
                        <DashboardTableCell>{CurrencyFormat(currencies[selectedCurrency.index].price)}</DashboardTableCell>
                        <DashboardTableCell>
                            {selectedCurrency.totals &&
                                <div className="flex flex-col">
                                    <div>
                                        {CurrencyFormat(selectedCurrency.totals.totalValue)}
                                    </div>  
                                    <div className="text-sm">
                                        {selectedCurrency.totals.totalAmount}
                                    </div>  
                                </div>
                            }
                        </DashboardTableCell>
                        <DashboardTableCell>
                            {selectedCurrency.totals &&
                                <div className={classNames('flex', {
                                'text-green' : selectedCurrency.totals.totalPercentageDifference  > 0,
                                'text-red' : selectedCurrency.totals.totalPercentageDifference  < 0,
                            })} >
                                    {PercentageFormat(selectedCurrency.totals.totalPercentageDifference)}
                                </div>
                            }
                        </DashboardTableCell>
                        <DashboardTableCell align={"right"} position={"last"}>
                            {index > 0 && <IconButton id="action" onClick={() => handleOrderCurrencyUp(selectedCurrency)}><Icon id="Up" color="white" /></IconButton> }
                            {index + 1 < selectedCurrencies.length && <IconButton onClick={() => handleOrderCurrencyDown(selectedCurrency)}><Icon id="Down" color="white" /></IconButton> } 
                            <IconButton id="link" to={selectedCurrency.name}><Icon id="Edit" color="white" /></IconButton>
                            <IconButton id="action" onClick={() => handleRemoveCurrency(selectedCurrency)}><Icon id="Remove" color="white" /></IconButton> 
                        </DashboardTableCell>
                    </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;