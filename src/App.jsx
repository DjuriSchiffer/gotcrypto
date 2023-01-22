import { useEffect } from "react";
import { getCurrencies } from "./api";
import { useLocalForage } from "./hooks/useLocalForage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReducerProvider, { useDispatch } from "./hooks/useReducer";
import Overview from "./pages/Overview";
import Dashboard from "./pages/Dashboard";
import Error from "./components/Error";

const Bootstrap = () => {
  const currenciesQuery = getCurrencies();
  const dispatch = useDispatch();
  const [setLocalForage, initStore] = useLocalForage();

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
          initStore("selectedCurrencies");
        }
      }
    });
  }, [currenciesQuery, dispatch]);

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
