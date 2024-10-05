// src/hooks/useLocalForage.ts

import localForage from 'localforage';
import { useAppDispatch } from '../hooks/useReducer';
import { useCallback } from 'react';
import { Currency } from '../types/store';

export const useLocalForage = () => {
  const dispatch = useAppDispatch();

  const setLocalForage = useCallback(
    (key: string, value: Currency[], callback?: () => void): void => {
      localForage
        .setItem(key, value)
        .then(() => {
          dispatch({
            type: 'SET_SELECTED_CURRENCIES',
            payload: value,
          });
          if (typeof callback === 'function') {
            callback();
          }
        })
        .catch((err: any) => {
          dispatch({
            type: 'SET_ERROR',
            payload: true,
          });
          console.error(`Error setting ${key} in localForage:`, err);
        });
    },
    [dispatch]
  );

  const initStore = useCallback(
    (key: string): void => {
      localForage
        .getItem<Currency[]>(key)
        .then((values) => {
          if (values === null) {
            setLocalForage(key, []);
          } else {
            setLocalForage(key, values);
          }
        })
        .catch((err: any) => {
          dispatch({
            type: 'SET_ERROR',
            payload: true,
          });
          console.error(`Error initializing ${key} from localForage:`, err);
        });
    },
    [setLocalForage, dispatch]
  );

  return { setLocalForage, initStore };
};
