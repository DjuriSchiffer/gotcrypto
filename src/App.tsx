import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getCurrencies } from './api';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import ErrorComponent from './components/Error';
import { GetCurrenciesResponse } from './types/api';
import { FetchedCurrency } from './types/currency';
import AuthChoice from './components/AuthChoice';
import ProtectedRoute from './components/ProtectedRoute';
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
            dispatch({
              type: 'SET_ERROR',
              payload: true,
            });
          } else if (data.data) {
            const currenciesArr: FetchedCurrency[] = [];

            for (const [key, value] of Object.entries(data.data)) {
              currenciesArr.push({
                name: value.name,
                price: parseFloat(value.quote.EUR.price.toFixed(2)),
                slug: value.slug,
                cmc_id: value.id,
              });
            }

            dispatch({
              type: 'SET_FETCHED_CURRENCIES',
              payload: currenciesArr,
            });
            // setSelectedCurrencies([]); // Clear database
          }
        }
      } catch (error: any) {
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
        <Route path=":slug" element={user ? <Detail /> : <AuthChoice />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path=":slug"
          element={
            <ProtectedRoute>
              <Detail />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ErrorComponent />
    </Router>
  );
};

export default App;
