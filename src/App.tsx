import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCurrencies } from './api';

import { useLocalForage } from './hooks/useLocalForage';
import ReducerProvider, { useAppDispatch } from './hooks/useReducer';
import Overview from './pages/Overview';
import Dashboard from './pages/Dashboard';
import ErrorComponent from './components/Error';
import { GetCurrenciesResponse } from './types/api';

const Bootstrap: React.FC = () => {
  const dispatch = useAppDispatch();
  const { setLocalForage, initStore } = useLocalForage();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data: GetCurrenciesResponse = await getCurrencies();

        if (data.status.error_code === 0) {
          if (data.error) {
            dispatch({
              type: 'SET_ERROR',
              payload: true,
            });
          } else if (data.data) {
            const currenciesArr: Record<
              string,
              {
                name: string;
                price: number;
                slug: string;
                cmc_id: number;
              }
            > = {};

            for (const [key, value] of Object.entries(data.data)) {
              currenciesArr[key] = {
                name: value.name,
                price: parseFloat(value.quote.EUR.price.toFixed(2)),
                slug: value.slug,
                cmc_id: value.id,
              };
            }

            dispatch({
              type: 'SET_INITIAL_CURRENCIES',
              payload: currenciesArr,
            });

            initStore('selectedCurrencies');
          }
        }
      } catch (error: any) {
        dispatch({
          type: 'SET_ERROR',
          payload: error.message || 'An unexpected error occurred',
        });
      }
    };

    fetchCurrencies();
  }, [dispatch, initStore]);

  return null;
};

const App: React.FC = () => {
  return (
    <ReducerProvider>
      <BrowserRouter>
        <Bootstrap />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path=":overviewSlug" element={<Overview />} />
        </Routes>
        <ErrorComponent />
      </BrowserRouter>
    </ReducerProvider>
  );
};

export default App;
