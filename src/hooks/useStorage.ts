import { useAuth } from './useAuth';
import { useLocalForage } from './useLocalForage';
import {
  fetchSelectedCurrenciesFromFirestore,
  getUserDocRef,
  setSelectedCurrenciesInFirestore,
} from '../firebase/firebaseHelpers';
import { useEffect, useState, useCallback } from 'react';
import { SelectedAsset } from 'currency';
import { useAppState } from './useAppState';
import { DateLocale, DashboardLayout, SortMethod } from 'store';
import localforage from 'localforage';
import { useAppDispatch } from './useAppDispatch';
import { getDoc, updateDoc } from 'firebase/firestore';
import { CurrencyQuote } from 'api';

const STORAGE_KEY = 'selectedCurrencies';
const SORT_METHOD_KEY = 'sortMethod';
const CURRENCY_QUOTE = 'currencyQuote';
const CUSTOM_ORDER_KEY = 'customOrder';
const DATE_LOCALE = 'dateLocale';
const DASHBOARD_LAYOUT = 'dashboardLayout';

export const useStorage = () => {
  const { user, isAnonymous } = useAuth();
  const dispatch = useAppDispatch();
  const { setLocalForage, getSelectedCurrencies } = useLocalForage();
  const { sortMethod: globalSortMethod, currencyQuote: globalCurrencyQuote, dateLocale: globalDateLocale, dashboardLayout: globalDashboardLayout } = useAppState();
  const [selectedCurrencies, setSelectedCurrenciesState] = useState<
    SelectedAsset[]
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
      let savedCustomOrder: number[] = [];
      let savedCurrencyQuote: keyof CurrencyQuote = 'EUR';
      let savedDateLocale: DateLocale = 'nl';
      let savedDashboardLayout: DashboardLayout = 'Grid';

      if (user && !isAnonymous) {
        const userDocRef = getUserDocRef(user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          savedSortMethod = (data.sortMethod) || 'has_selected';
          savedCustomOrder = (data.customOrder) || [];
          savedCurrencyQuote = (data.currencyQuote) || 'EUR';
          savedDateLocale = (data.dateLocale) || 'nl';
          savedDashboardLayout = (data.dashboardLayout) || 'Grid';
        }
      } else {
        const sortMethodFromStorage = await localforage.getItem<string>(
          SORT_METHOD_KEY
        );
        const customOrderFromStorage = await localforage.getItem<number[]>(
          CUSTOM_ORDER_KEY
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
        savedSortMethod = (sortMethodFromStorage as SortMethod) || 'has_selected';
        savedCustomOrder = customOrderFromStorage || [];
        savedCurrencyQuote = currencyQuoteFromStorage || 'EUR';
        savedDateLocale = dateLocaleFromStorage || 'nl';
        savedDashboardLayout = dashboardLayoutFromStorage || 'Grid';
      }

      dispatch({
        type: 'SET_SORT_METHOD',
        payload: savedSortMethod,
      });
      dispatch({
        type: 'SET_CURRENCY_QUOTE',
        payload: savedCurrencyQuote,
      });
      dispatch({
        type: 'SET_DATE_LOCALE',
        payload: savedDateLocale,
      });
      dispatch({
        type: 'SET_DASHBOARD_LAYOUT',
        payload: savedDashboardLayout,
      });

      setLoading(false);
    };
    initialize();
  }, [user, isAnonymous, getSelectedCurrencies, dispatch]);

  const setSelectedCurrencies = useCallback(
    async (assets: SelectedAsset[]) => {
      setSelectedCurrenciesState(assets);
      if (user && !isAnonymous) {
        await setSelectedCurrenciesInFirestore(user.uid, assets);
      } else {
        await setLocalForage(STORAGE_KEY, assets);
      }
    },
    [user, isAnonymous, setLocalForage, setSelectedCurrenciesInFirestore]
  );

  const updateCurrency = useCallback(
    async (updatedAsset: SelectedAsset) => {
      let updatedAssets: SelectedAsset[];

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
        await setLocalForage(STORAGE_KEY, updatedAssets);
      }
    },
    [
      selectedCurrencies,
      setSelectedCurrenciesState,
      user,
      isAnonymous,
      setSelectedCurrenciesInFirestore,
      setLocalForage,
    ]
  );

  const setSortMethod = useCallback(
    async (method: SortMethod) => {
      try {
        dispatch({
          type: 'SET_SORT_METHOD',
          payload: method,
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
          type: 'SET_ERROR',
          payload: true,
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setCurrencyQuote = useCallback(
    async (quote: keyof CurrencyQuote) => {
      try {
        dispatch({
          type: 'SET_CURRENCY_QUOTE',
          payload: quote,
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
          type: 'SET_ERROR',
          payload: true,
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setDateLocale = useCallback(
    async (locale: DateLocale) => {
      try {
        dispatch({
          type: 'SET_DATE_LOCALE',
          payload: locale,
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
          type: 'SET_ERROR',
          payload: true,
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  const setDashboardLayout = useCallback(
    async (dashboardLayout: DashboardLayout) => {
      try {
        dispatch({
          type: 'SET_DASHBOARD_LAYOUT',
          payload: dashboardLayout,
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
          type: 'SET_ERROR',
          payload: true,
        });
      }
    },
    [user, isAnonymous, dispatch]
  );

  return {
    selectedCurrencies,
    setSelectedCurrencies,
    updateCurrency,
    sortMethod: globalSortMethod,
    setSortMethod,
    currencyQuote: globalCurrencyQuote,
    setCurrencyQuote,
    dateLocale: globalDateLocale,
    setDateLocale,
    dashboardLayout: globalDashboardLayout,
    setDashboardLayout,
    loading,
  };
};
