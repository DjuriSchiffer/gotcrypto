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
                    dispatch({
                        type: "SET_ERROR",
                        payload: data.error
                    });
                } else {
                    let currenciesArr = [];
                    let assetsArr = [];
                    Object.keys(data.data).map(key => {
                        const slug = /[^-]*/.exec(data.data[key].slug)[0];
                        const price = parseFloat(data.data[key].quote.EUR.price.toFixed(2));
                        const name = data.data[key].name;

                        currenciesArr[slug] = {
                            name: name,
                            price: price,
                            slug: slug
                        };
                        assetsArr[slug] = [];

                        localForage.getItem(slug).then(data => {
                            if (data === null) {
                                localForage.setItem(slug, []);
                                dispatch({
                                    type: "SET_ASSETS",
                                    payload: assetsArr
                                });
                            } else {
                                assetsArr[slug] = data;
                                dispatch({
                                    type: "SET_ASSETS",
                                    payload: assetsArr
                                });
                            }
                        }).catch(function(err) {
                            // This code runs if there were any errors
                            dispatch({
                                type: "SET_ERROR",
                                payload: err
                            });
                        });
                    });

                    dispatch({
                        type: "SET_INITIAL_CURRENCIES",
                        payload: currenciesArr
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