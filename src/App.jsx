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
            payload: data.error,
          });
        } else {
          let currenciesArr = [];
          for (const [key, value] of Object.entries(data.data)) {
            currenciesArr[key] = {
              name: value.slug,
              price: parseFloat(value.quote.EUR.price.toFixed(2)),
              slug: value.name,
              cmc_id: value.id,
            };
          }
          dispatch({
            type: "SET_INITIAL_CURRENCIES",
            payload: currenciesArr,
          });
          localForage
            .getItem("selectedCurrencies")
            .then((values) => {
              if (values === null) {
                localForage.setItem("selectedCurrencies", []);
                dispatch({
                  type: "SET_SELECTED_CURRENCIES",
                  payload: [],
                });
              } else {
                dispatch({
                  type: "SET_SELECTED_CURRENCIES",
                  payload: values,
                });
              }
            })
            .catch(function (err) {
              console.log(err);
              // This code runs if there were any errors
              dispatch({
                type: "SET_ERROR",
                payload: err,
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
          <Route path=":overviewSlug" element={<Overview />} />
        </Routes>
        <Error />
      </BrowserRouter>
    </ReducerProvider>
  );
}

export default App;
