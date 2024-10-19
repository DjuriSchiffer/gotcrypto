import { useAuth } from './useAuth';
import { useLocalForage } from './useLocalForage';
import {
  fetchSelectedCurrenciesFromFirestore,
  getUserDocRef,
  setSelectedCurrenciesInFirestore,
} from '../firebase/firebaseHelpers';
import { useEffect, useState, useCallback } from 'react';
import { SelectedCurrency } from 'currency';
import { useAppState } from './useAppState';
import { SortMethod } from 'store';
import localforage from 'localforage';
import { useAppDispatch } from './useAppDispatch';
import { getDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'selectedCurrencies';
const SORT_METHOD_KEY = 'sortMethod';
const CUSTOM_ORDER_KEY = 'customOrder';

export const useStorage = () => {
  const { user, isAnonymous } = useAuth();
  const dispatch = useAppDispatch();
  const { setLocalForage, getSelectedCurrencies } = useLocalForage();
  const { sortMethod: globalSortMethod } = useAppState();
  const [selectedCurrencies, setSelectedCurrenciesState] = useState<
    SelectedCurrency[]
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

      let savedSortMethod: SortMethod = 'cmc_rank';
      let savedCustomOrder: number[] = [];

      if (user && !isAnonymous) {
        const userDocRef = getUserDocRef(user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          savedSortMethod = (data.sortMethod as SortMethod) || 'cmc_rank';
          savedCustomOrder = (data.customOrder as number[]) || [];
        }
      } else {
        const sortMethodFromStorage = await localforage.getItem<string>(
          SORT_METHOD_KEY
        );
        savedSortMethod = (sortMethodFromStorage as SortMethod) || 'cmc_rank';
        const customOrderFromStorage = await localforage.getItem<number[]>(
          CUSTOM_ORDER_KEY
        );
        savedCustomOrder = customOrderFromStorage || [];
      }

      dispatch({
        type: 'SET_SORT_METHOD',
        payload: savedSortMethod,
      });

      setLoading(false);
    };
    initialize();
  }, [user, isAnonymous, getSelectedCurrencies, dispatch]);

  const setSelectedCurrencies = useCallback(
    async (currencies: SelectedCurrency[]) => {
      setSelectedCurrenciesState(currencies);
      if (user && !isAnonymous) {
        await setSelectedCurrenciesInFirestore(user.uid, currencies);
      } else {
        await setLocalForage(STORAGE_KEY, currencies);
      }
    },
    [user, isAnonymous, setLocalForage, setSelectedCurrenciesInFirestore]
  );

  const updateCurrency = useCallback(
    async (updatedCurrency: SelectedCurrency) => {
      let updatedCurrencies: SelectedCurrency[];

      const currencyExists = selectedCurrencies.some(
        (currency) => currency.cmc_id === updatedCurrency.cmc_id
      );

      if (currencyExists) {
        updatedCurrencies = selectedCurrencies.map((currency) =>
          currency.cmc_id === updatedCurrency.cmc_id
            ? updatedCurrency
            : currency
        );
      } else {
        updatedCurrencies = [...selectedCurrencies, updatedCurrency];
      }

      setSelectedCurrenciesState(updatedCurrencies);

      if (user && !isAnonymous) {
        await setSelectedCurrenciesInFirestore(user.uid, updatedCurrencies);
      } else {
        await setLocalForage(STORAGE_KEY, updatedCurrencies);
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

  return {
    selectedCurrencies,
    setSelectedCurrencies,
    updateCurrency,
    sortMethod: globalSortMethod,
    setSortMethod,
    loading,
  };
};
