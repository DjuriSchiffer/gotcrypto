import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getCurrencies } from './api';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import ErrorComponent from './components/Error';
import { GetCurrenciesResponse } from './types/api';
import { FetchedCurrency } from './types/currency';
import AuthChoice from './components/AuthChoice';
import { useAuth } from './hooks/useAuth';
import { useStorage } from './hooks/useStorage';
import { useAppDispatch } from './hooks/useAppDispatch';

const Bootstrap: React.FC = () => {
  const dispatch = useAppDispatch();
  const { setSelectedCurrencies } = useStorage();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data: GetCurrenciesResponse = await getCurrencies();

        if (data.status.error_code === 0) {
          if (data.error) {
            console.error('API Error:', data.status.error_message);
            dispatch({
              type: 'SET_ERROR',
              payload: true,
            });
          } else if (data.data) {
            const currenciesArr: FetchedCurrency[] = Object.values(data.data)
              .map((currency) => ({
                name: currency.name,
                price: parseFloat(currency.quote.EUR.price.toFixed(2)),
                slug: currency.slug,
                cmc_id: currency.id,
                cmc_rank: currency.cmc_rank || null,
              }))
              .sort((a, b) => {
                if (a.cmc_rank !== null && b.cmc_rank !== null) {
                  return a.cmc_rank - b.cmc_rank;
                } else if (a.cmc_rank !== null && b.cmc_rank === null) {
                  return -1;
                } else if (a.cmc_rank === null && b.cmc_rank !== null) {
                  return 1;
                } else {
                  return 0;
                }
              });
            dispatch({
              type: 'SET_FETCHED_CURRENCIES',
              payload: currenciesArr,
            });

            // setSelectedCurrencies([]); // Reset user data, usefull for debuging
          }
        } else {
          console.error(
            'API Returned Non-Zero Error Code:',
            data.status.error_message
          );
          dispatch({
            type: 'SET_ERROR',
            payload: true,
          });
        }
      } catch (error: any) {
        console.error('Fetch Currencies Error:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: true,
        });
      }
    };

    fetchCurrencies();
  }, [dispatch, setSelectedCurrencies]);

  return null;
};

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Bootstrap />
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <AuthChoice />} />
        <Route path="/:slug" element={user ? <Detail /> : <AuthChoice />} />
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
      <ErrorComponent />
    </Router>
  );
};
export default App;
