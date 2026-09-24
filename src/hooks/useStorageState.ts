import type { SelectedAsset } from 'currency';
import type { DashboardLayout, DateLocale, SortMethod } from 'store';
import type { CurrencyQuote } from 'api';

import { getDoc } from 'firebase/firestore';
import localforage from 'localforage';
import { useCallback, useEffect, useState } from 'react';

import {
	getUserDocRef,
	saveUserFields,
	setSelectedCurrenciesInFirestore,
} from '../firebase/firebaseHelpers';
import totals from '../utils/totals';
import { useAppDispatch } from './useAppDispatch';
import { useAppState } from './useAppState';
import { useAuth } from './useAuth';
import { useLocalForage } from './useLocalForage';
import { readPreferences, type Preferences } from '../utils/preferences';

const STORAGE_KEY = 'selectedCurrencies';

/** Preference names double as their localforage keys, matching what existing users already have. */
const PREFERENCE_KEYS: ReadonlyArray<keyof Preferences> = [
	'currencyQuote',
	'dashboardLayout',
	'dateLocale',
	'onboardingCompleted',
	'sortMethod',
];

const withFreshTotals = (assets: Array<SelectedAsset>): Array<SelectedAsset> =>
	assets.map((asset) => ({ ...asset, totals: totals(asset.transactions ?? []) }));

export const useStorageState = () => {
	const { isAnonymous, loading: authLoading, user } = useAuth();
	const dispatch = useAppDispatch();
	const { getSelectedCurrencies, setLocalForage } = useLocalForage();
	const { currencyQuote, dashboardLayout, dateLocale, sortMethod } = useAppState();

	const [selectedCurrencies, setSelectedCurrenciesState] = useState<Array<SelectedAsset>>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(false);

	const isSignedIn = Boolean(user && !isAnonymous);

	// Load everything once auth is known, and again whenever the user changes
	useEffect(() => {
		if (authLoading) return;

		let cancelled = false;

		const initialize = async () => {
			setLoading(true);

			let currencies: Array<SelectedAsset> = [];
			let rawPreferences: Record<string, unknown> = {};

			try {
				if (user && !isAnonymous) {
					// One read: currencies and preferences live in the same document
					const snapshot = await getDoc(getUserDocRef(user.uid));
					const data = snapshot.exists() ? snapshot.data() : {};
					currencies = (data.selectedCurrencies ?? []) as Array<SelectedAsset>;
					rawPreferences = data;
				} else {
					currencies = await getSelectedCurrencies(STORAGE_KEY);
					const entries = await Promise.all(
						PREFERENCE_KEYS.map(async (key) => [key, await localforage.getItem(key)] as const)
					);
					rawPreferences = Object.fromEntries(entries);
				}
			} catch (error) {
				console.error('Error loading stored data:', error);
				dispatch({ payload: true, type: 'SET_ERROR' });
			}

			if (cancelled) return;

			const preferences = readPreferences(rawPreferences);

			setSelectedCurrenciesState(withFreshTotals(currencies));
			dispatch({ payload: preferences.sortMethod, type: 'SET_SORT_METHOD' });
			dispatch({ payload: preferences.currencyQuote, type: 'SET_CURRENCY_QUOTE' });
			dispatch({ payload: preferences.dateLocale, type: 'SET_DATE_LOCALE' });
			dispatch({ payload: preferences.dashboardLayout, type: 'SET_DASHBOARD_LAYOUT' });
			setOnboardingCompletedState(preferences.onboardingCompleted);
			setLoading(false);
		};

		void initialize();

		return () => {
			cancelled = true;
		};
	}, [authLoading, user, isAnonymous, getSelectedCurrencies, dispatch]);

	/** Saves one preference to Firestore (signed in) or localforage (anonymous). */
	const savePreference = useCallback(
		async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
			try {
				if (user && !isAnonymous) {
					await saveUserFields(user.uid, { [key]: value });
				} else {
					await localforage.setItem(key, value);
				}
			} catch (error) {
				console.error(`Error saving ${key}:`, error);
				dispatch({ payload: true, type: 'SET_ERROR' });
			}
		},
		[user, isAnonymous, dispatch]
	);

	const persistCurrencies = useCallback(
		async (assets: Array<SelectedAsset>) => {
			if (user && !isAnonymous) {
				await setSelectedCurrenciesInFirestore(user.uid, assets);
			} else {
				setLocalForage(STORAGE_KEY, assets);
			}
		},
		[user, isAnonymous, setLocalForage]
	);

	const setSelectedCurrencies = useCallback(
		async (assets: Array<SelectedAsset>) => {
			const normalized = withFreshTotals(assets);
			setSelectedCurrenciesState(normalized);
			await persistCurrencies(normalized);
		},
		[persistCurrencies]
	);

	const updateCurrency = useCallback(
		async (updatedAsset: SelectedAsset) => {
			const fresh = { ...updatedAsset, totals: totals(updatedAsset.transactions) };
			const exists = selectedCurrencies.some((asset) => asset.cmc_id === fresh.cmc_id);

			const updatedAssets = exists
				? selectedCurrencies.map((asset) => (asset.cmc_id === fresh.cmc_id ? fresh : asset))
				: [...selectedCurrencies, fresh];

			setSelectedCurrenciesState(updatedAssets);
			await persistCurrencies(updatedAssets);
		},
		[selectedCurrencies, persistCurrencies]
	);

	const setSortMethod = useCallback(
		async (method: SortMethod) => {
			dispatch({ payload: method, type: 'SET_SORT_METHOD' });
			await savePreference('sortMethod', method);
		},
		[dispatch, savePreference]
	);

	const setCurrencyQuote = useCallback(
		async (quote: keyof CurrencyQuote) => {
			dispatch({ payload: quote, type: 'SET_CURRENCY_QUOTE' });
			await savePreference('currencyQuote', quote);
		},
		[dispatch, savePreference]
	);

	const setDateLocale = useCallback(
		async (locale: DateLocale) => {
			dispatch({ payload: locale, type: 'SET_DATE_LOCALE' });
			await savePreference('dateLocale', locale);
		},
		[dispatch, savePreference]
	);

	const setDashboardLayout = useCallback(
		async (layout: DashboardLayout) => {
			dispatch({ payload: layout, type: 'SET_DASHBOARD_LAYOUT' });
			await savePreference('dashboardLayout', layout);
		},
		[dispatch, savePreference]
	);

	const setOnboardingCompleted = useCallback(
		async (completed: boolean) => {
			setOnboardingCompletedState(completed);
			await savePreference('onboardingCompleted', completed);
		},
		[savePreference]
	);

	return {
		currencyQuote,
		dashboardLayout,
		dateLocale,
		isSignedIn,
		loading,
		onboardingCompleted,
		selectedCurrencies,
		setCurrencyQuote,
		setDashboardLayout,
		setDateLocale,
		setOnboardingCompleted,
		setSelectedCurrencies,
		setSortMethod,
		sortMethod,
		updateCurrency,
	};
};
