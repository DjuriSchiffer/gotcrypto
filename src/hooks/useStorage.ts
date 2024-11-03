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
import { SortMethod } from 'store';
import localforage from 'localforage';
import { useAppDispatch } from './useAppDispatch';
import { getDoc, updateDoc } from 'firebase/firestore';
import { CurrencyQuote } from 'api';

const STORAGE_KEY = 'selectedCurrencies';
const SORT_METHOD_KEY = 'sortMethod';
const CURRENCY_QUOTE = 'currencyQuote';
const CUSTOM_ORDER_KEY = 'customOrder';

export const useStorage = () => {
  const { user, isAnonymous } = useAuth();
  const dispatch = useAppDispatch();
  const { setLocalForage, getSelectedCurrencies } = useLocalForage();
  const { sortMethod: globalSortMethod, currencyQuote: globalCurrencyQuote } = useAppState();
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

      if (user && !isAnonymous) {
        const userDocRef = getUserDocRef(user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          savedSortMethod = (data.sortMethod as SortMethod) || 'has_selected';
          savedCustomOrder = (data.customOrder as number[]) || [];
          savedCurrencyQuote = (data.currencyQuote) || 'EUR';
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
        savedSortMethod = (sortMethodFromStorage as SortMethod) || 'has_selected';
        savedCustomOrder = customOrderFromStorage || [];
        savedCurrencyQuote = currencyQuoteFromStorage || 'EUR';
      }

      dispatch({
        type: 'SET_SORT_METHOD',
        payload: savedSortMethod,
      });
      dispatch({
        type: 'SET_CURRENCY_QUOTE',
        payload: savedCurrencyQuote,
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

  return {
    selectedCurrencies,
    setSelectedCurrencies,
    updateCurrency,
    sortMethod: globalSortMethod,
    setSortMethod,
    currencyQuote: globalCurrencyQuote,
    setCurrencyQuote,
    loading,
  };
};
