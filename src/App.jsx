import { useEffect } from "react";
import { getCurrencies } from "./api";
import localForage from "localforage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReducerProvider, { useDispatch } from "./hooks/useReducer";
import Overview from "./pages/Overview";
import Dashboard from "./pages/Dashboard";
import Error from "./components/Error";

const Bootstrap = () => {
    const currenciesQuery = getCurrencies();
    const dispatch = useDispatch();

    useEffect(() => {
        currenciesQuery.then((data) => {
            if (data.data !== undefined || data.status.error_code !== 0) {
                if (data.error) {
                    console.log(err)
                    dispatch({
                        type: "SET_ERROR",
                        payload: data.error
                    });
                } else {
                    let currenciesArr = [];

                    data.data.map((item) => {
                        currenciesArr[item.cmc_rank] = {
                            name: item.slug,
                            price: parseFloat(item.quote.USD.price.toFixed(2)),
                            slug: item.name,
                            cmc_id: item.id    
                        };
                    })
                    dispatch({
                        type: "SET_INITIAL_CURRENCIES",
                        payload: currenciesArr
                    });
                    localForage.getItem('selectedCurrencies').then(values => {
                        if (values === null) {
                            localForage.setItem('selectedCurrencies', []);
                            dispatch({
                                type: "SET_SELECTED_CURRENCIES",
                                payload: []
                            });
                        } else {
                            dispatch({
                                type: "SET_SELECTED_CURRENCIES",
                                payload: values
                            });
                        }
                    }).catch(function(err) {
                        console.log(err)
                        // This code runs if there were any errors
                        dispatch({
                            type: "SET_ERROR",
                            payload: err
                        });
                    });
                }
            }
        });
    }, [currenciesQuery]);

    return null;
};

function App() {
    return (
        <ReducerProvider>
            <BrowserRouter>
                <Bootstrap />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path=":overviewSlug" element={<Overview />}/>
                </Routes>
                <Error />
            </BrowserRouter>
        </ReducerProvider>
    );
}

export default App;