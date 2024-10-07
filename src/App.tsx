import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { getCurrencies } from './api';

import { useLocalForage } from './hooks/useLocalForage';
import ReducerProvider, { useAppDispatch } from './hooks/useReducer';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import ErrorComponent from './components/Error';
import { GetCurrenciesResponse } from './types/api';
import { FetchedCurrency } from './types/currency';
import { useAuth } from './contexts/AuthContext';
import AuthChoice from './components/AuthChoice';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';

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
            const currenciesArr: Record<string, FetchedCurrency> = {};

            for (const [key, value] of Object.entries(data.data)) {
              currenciesArr[key] = {
                name: value.name,
                price: parseFloat(value.quote.EUR.price.toFixed(2)),
                slug: value.slug,
                cmc_id: value.id,
              };
            }

            dispatch({
              type: 'SET_FETCHED_CURRENCIES',
              payload: currenciesArr,
            });

            initStore('selectedCurrencies');
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
  }, [dispatch, initStore]);

  return null;
};

const App: React.FC = () => {
  const { user, loading, isAnonymous } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <ReducerProvider>
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
    </ReducerProvider>
  );
};

export default App;
