import { Suspense, useEffect } from "react";
import { getCurrencies } from "./api";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReducerProvider, { useDispatch } from "./hooks/useReducer";
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
          let currensiesArr = [];
          Object.keys(data.data).map(key => {
            const slug = /[^-]*/.exec(data.data[key].slug)[0];
            const price = parseFloat(data.data[key].quote.EUR.price.toFixed(2));
            const name = data.data[key].name;

            currensiesArr[key] = {
              name : name,
              price : price,
              slug : slug
            };
          });

          dispatch({
            type: "SET_INITIAL_CURRENCIES",
            payload: currensiesArr
          });
        }
      }
    });
  }, [currenciesQuery]);

  return null;
};

function App() {
  return (
      <Suspense fallback="">
        <ReducerProvider>
          <BrowserRouter>
            <Bootstrap />
            <Routes>
              <Route path="/" element={<Dashboard />}>
                  <Route path=":currencySlug" element={<Dashboard />}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </ReducerProvider>
      </Suspense>
  );
}

export default App;