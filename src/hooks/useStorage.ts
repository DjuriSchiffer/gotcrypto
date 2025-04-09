import type { CurrencyQuote } from 'api';
import type { SelectedAsset } from 'currency';
import type { DashboardLayout, DateLocale, SortMethod } from 'store';

import { getDoc, updateDoc } from 'firebase/firestore';
import localforage from 'localforage';
import { useCallback, useEffect, useState } from 'react';

import {
  fetchSelectedCurrenciesFromFirestore,
  getUserDocRef,
  setSelectedCurrenciesInFirestore,
} from '../firebase/firebaseHelpers';
import { useAppDispatch } from './useAppDispatch';
import { useAppState } from './useAppState';
import { useAuth } from './useAuth';
import { useLocalForage } from './useLocalForage';

const STORAGE_KEY = 'selectedCurrencies';
const SORT_METHOD_KEY = 'sortMethod';
const CURRENCY_QUOTE = 'currencyQuote';
const DATE_LOCALE = 'dateLocale';
const DASHBOARD_LAYOUT = 'dashboardLayout';

export const useStorage = () => {
  const { isAnonymous, user } = useAuth();
  const dispatch = useAppDispatch();
  const { getSelectedCurrencies, setLocalForage } = useLocalForage();
  const { currencyQuote: globalCurrencyQuote, dashboardLayout: globalDashboardLayout, dateLocale: globalDateLocale, sortMethod: globalSortMethod } = useAppState();
  const [selectedCurrencies, setSelectedCurrenciesState] = useState<
    Array<SelectedAsset>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize storage on mount
  useEffect(() => {
    const initialize = async () => {
      if (user && !isAnonymous) {
        // User is logged in, fetch from Firestore
        const savedCurrencies = await fetchSelectedCurrenciesFromFirestore(
          user.uid
        );
        setSelectedCurrenciesState(savedCurrencies);
      } else {
        // User is anonymous, fetch from localForage
        const savedCurrencies = await getSelectedCurrencies(STORAGE_KEY);
        setSelectedCurrenciesState(savedCurrencies);
      }

      let savedSortMethod: SortMethod = 'has_selected';
      let savedCurrencyQuote: keyof CurrencyQuote = 'EUR';
      let savedDateLocale: DateLocale = 'nl';
      let savedDashboardLayout: DashboardLayout = 'Grid';

      if (user && !isAnonymous) {
        const userDocRef = getUserDocRef(user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          savedSortMethod = (data.sortMethod as SortMethod);
          savedCurrencyQuote = (data.currencyQuote as keyof CurrencyQuote);
          savedDateLocale = (data.dateLocale as DateLocale);
          savedDashboardLayout = (data.dashboardLayout as DashboardLayout);
        }
      } else {
        const sortMethodFromStorage = await localforage.getItem<string>(
          SORT_METHOD_KEY
        );
        const currencyQuoteFromStorage = await localforage.getItem<keyof CurrencyQuote>(
          CURRENCY_QUOTE
        );
        const dateLocaleFromStorage = await localforage.getItem<DateLocale>(
          DATE_LOCALE
        );
        const dashboardLayoutFromStorage = await localforage.getItem<DashboardLayout>(
          DASHBOARD_LAYOUT
        );
        savedSortMethod = (sortMethodFromStorage as SortMethod);
        savedCurrencyQuote = currencyQuoteFromStorage || 'EUR';
        savedDateLocale = dateLocaleFromStorage || 'nl';
        savedDashboardLayout = dashboardLayoutFromStorage || 'Grid';
      }

      dispatch({
        payload: savedSortMethod,
        type: 'SET_SORT_METHOD',
      });
      dispatch({
        payload: savedCurrencyQuote,
        type: 'SET_CURRENCY_QUOTE',
      });
      dispatch({
        payload: savedDateLocale,
        type: 'SET_DATE_LOCALE',
      });
      dispatch({
        payload: savedDashboardLayout,
        type: 'SET_DASHBOARD_LAYOUT',
      });

      setLoading(false);
    };
    void initialize();
  }, [user, isAnonymous, getSelectedCurrencies, dispatch]);

  const setSelectedCurrencies = useCallback(
    async (assets: Array<SelectedAsset>) => {
      setSelectedCurrenciesState(assets);
      if (user && !isAnonymous) {
        await setSelectedCurrenciesInFirestore(user.uid, assets);
      } else {
        setLocalForage(STORAGE_KEY, assets);
      }
    },
    [user, isAnonymous, setLocalForage]
  );

  const updateCurrency = useCallback(
    async (updatedAsset: SelectedAsset) => {
      let updatedAssets: Array<SelectedAsset>;

      const assetExists = selectedCurrencies.some(
        (asset) => asset.cmc_id === updatedAsset.cmc_id
      );

      if (assetExists) {
        updatedAssets = selectedCurrencies.map((asset) =>
          asset.cmc_id === updatedAsset.cmc_id
            ? updatedAsset
            : asset
        );
      } else {
        updatedAssets = [...selectedCurrencies, updatedAsset];
      }

      setSelectedCurrenciesState(updatedAssets);

      if (user && !isAnonymous) {
        await setSelectedCurrenciesInFirestore(user.uid, updatedAssets);
      } else {
        setLocalForage(STORAGE_KEY, updatedAssets);
      }
    },
    [
      selectedCurrencies,
      setSelectedCurrenciesState,
      user,
      isAnonymous,
      setLocalForage,
    ]
  );

  const setSortMethod = useCallback(
    async (method: SortMethod) => {
      try {
        dispatch({
          payload: method,
          type: 'SET_SORT_METHOD',
        });

        if (user && !isAnonymous) {
          const userDocRef = getUserDocRef(user.uid);
          await updateDoc(userDocRef, { sortMethod: method });
        } else {
          await localforage.setItem(SORT_METHOD_KEY, method);
        }
      } catch (error) {
        console.error('Error setting sort method:', error);
        dispatch({
          payload: true,
          type: 'SET_ERROR',
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setCurrencyQuote = useCallback(
    async (quote: keyof CurrencyQuote) => {
      try {
        dispatch({
          payload: quote,
          type: 'SET_CURRENCY_QUOTE',
        });

        if (user && !isAnonymous) {
          const userDocRef = getUserDocRef(user.uid);
          await updateDoc(userDocRef, { currencyQuote: quote });
        } else {
          await localforage.setItem(CURRENCY_QUOTE, quote);
        }
      } catch (error) {
        console.error('Error setting sort method:', error);
        dispatch({
          payload: true,
          type: 'SET_ERROR',
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setDateLocale = useCallback(
    async (locale: DateLocale) => {
      try {
        dispatch({
          payload: locale,
          type: 'SET_DATE_LOCALE',
        });

        if (user && !isAnonymous) {
          const userDocRef = getUserDocRef(user.uid);
          await updateDoc(userDocRef, { dateLocale: locale });
        } else {
          await localforage.setItem(DATE_LOCALE, locale);
        }
      } catch (error) {
        console.error('Error setting sort method:', error);
        dispatch({
          payload: true,
          type: 'SET_ERROR',
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setDashboardLayout = useCallback(
    async (dashboardLayout: DashboardLayout) => {
      try {
        dispatch({
          payload: dashboardLayout,
          type: 'SET_DASHBOARD_LAYOUT',
        });

        if (user && !isAnonymous) {
          const userDocRef = getUserDocRef(user.uid);
          await updateDoc(userDocRef, { dashboardLayout: dashboardLayout });
        } else {
          await localforage.setItem(DASHBOARD_LAYOUT, dashboardLayout);
        }
      } catch (error) {
        console.error('Error setting dashboard layout:', error);
        dispatch({
          payload: true,
          type: 'SET_ERROR',
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  return {
    currencyQuote: globalCurrencyQuote,
    dashboardLayout: globalDashboardLayout,
    dateLocale: globalDateLocale,
    loading,
    selectedCurrencies,
    setCurrencyQuote,
    setDashboardLayout,
    setDateLocale,
    setSelectedCurrencies,
    setSortMethod,
    sortMethod: globalSortMethod,
    updateCurrency,
  };
};
