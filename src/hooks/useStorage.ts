import { useAuth } from './useAuth';
import { useLocalForage } from './useLocalForage';
import {
  fetchSelectedCurrenciesFromFirestore,
  setSelectedCurrenciesInFirestore,
} from '../firebase/firebaseHelpers';
import { useEffect, useState, useCallback } from 'react';
import { SelectedCurrency } from 'currency';
import { useAppState } from './useAppState';

const STORAGE_KEY = 'selectedCurrencies';
const SORT_METHOD_KEY = 'sortMethod';
const CUSTOM_ORDER_KEY = 'customOrder';

export const useStorage = () => {
  const { user, isAnonymous } = useAuth();
  const { setLocalForage, getSelectedCurrencies } = useLocalForage();
  const { sortMethod: globalSortMethod, customOrder: globalCustomOrder } =
    useAppState();
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

      setLoading(false);
    };
    initialize();
  }, [user, isAnonymous, getSelectedCurrencies]);

  // Function to set selected currencies
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

  // Function to update or add a currency
  const updateCurrency = useCallback(
    async (updatedCurrency: SelectedCurrency) => {
      let updatedCurrencies: SelectedCurrency[];

      const currencyExists = selectedCurrencies.some(
        (currency) => currency.cmc_id === updatedCurrency.cmc_id
      );

      if (currencyExists) {
        // Update existing currency
        updatedCurrencies = selectedCurrencies.map((currency) =>
          currency.cmc_id === updatedCurrency.cmc_id
            ? updatedCurrency
            : currency
        );
      } else {
        // Add new currency
        updatedCurrencies = [...selectedCurrencies, updatedCurrency];
      }

      // Update local state
      setSelectedCurrenciesState(updatedCurrencies);

      // Persist changes
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

  return {
    selectedCurrencies,
    setSelectedCurrencies,
    updateCurrency,
    loading,
  };
};
