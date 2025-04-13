import type { SelectedAsset } from 'currency';

import localForage from 'localforage';
import { useCallback } from 'react';

import { useAppDispatch } from './useAppDispatch';

export const useLocalForage = () => {
	const dispatch = useAppDispatch();

	const setLocalForage = useCallback(
		(key: string, value: Array<SelectedAsset>, callback?: () => void): void => {
			localForage
				.setItem(key, value)
				.then(() => {
					if (typeof callback === 'function') {
						callback();
					}
				})
				.catch((err: unknown) => {
					dispatch({
						payload: true,
						type: 'SET_ERROR',
					});
					console.error(`Error setting ${key} in localForage:`, err);
				});
		},
		[dispatch]
	);

	const getSelectedCurrencies = useCallback(
		async (key: string): Promise<Array<SelectedAsset>> => {
			try {
				const values = await localForage.getItem<Array<SelectedAsset>>(key);
				return values ?? [];
			} catch (err: unknown) {
				dispatch({
					payload: true,
					type: 'SET_ERROR',
				});
				console.error(`Error getting ${key} from localForage:`, err);
				return [];
			}
		},
		[dispatch]
	);

	return {
		getSelectedCurrencies,
		setLocalForage,
	};
};
