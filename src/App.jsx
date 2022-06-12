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
                    dispatch({type: "SET_ERROR"});
                } else {
                    let currenciesArr = [];
                    Object.keys(data.data).map(key => {
                        const slug = /[^-]*/.exec(data.data[key].slug)[0];
                        const price = parseFloat(data.data[key].quote.EUR.price.toFixed(2));
                        const name = data.data[key].name;

                        currenciesArr[slug] = {
                            name: name,
                            price: price,
                            slug: slug
                        };

                        localForage.getItem(slug).then(val => {
                            if (val === null) {
                                localForage.setItem(slug, []);
                            }
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
            </BrowserRouter>
        </ReducerProvider>
    );
}

export default App;