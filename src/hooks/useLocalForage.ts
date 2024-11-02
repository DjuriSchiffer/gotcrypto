import localForage from 'localforage';
import { useCallback } from 'react';
import { SelectedAsset } from 'currency';
import { useAppDispatch } from './useAppDispatch';

export const useLocalForage = () => {
  const dispatch = useAppDispatch();

  const setLocalForage = useCallback(
    (key: string, value: SelectedAsset[], callback?: () => void): void => {
      localForage
        .setItem(key, value)
        .then(() => {
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

  const getSelectedCurrencies = useCallback(
    async (key: string): Promise<SelectedAsset[]> => {
      try {
        const values = await localForage.getItem<SelectedAsset[]>(key);
        return values || [];
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: true,
        });
        console.error(`Error getting ${key} from localForage:`, err);
        return [];
      }
    },
    [dispatch]
  );

  return {
    setLocalForage,
    getSelectedCurrencies,
  };
};
