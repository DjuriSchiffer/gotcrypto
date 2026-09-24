import type { SelectedAsset } from 'currency';

import { doc, setDoc } from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export const getUserDocRef = (userId: string) => doc(db, 'users', userId);

/**
 * Writes the given fields to the user document, creating the document if it doesn't exist.
 * Fields that aren't passed are left untouched.
 */
export const saveUserFields = async (userId: string, fields: Record<string, unknown>) => {
	await setDoc(getUserDocRef(userId), fields, { merge: true });
};

/** Replaces the user's whole portfolio. (merge only applies per field; the array is replaced.) */
export const setSelectedCurrenciesInFirestore = async (
	userId: string,
	selectedAssets: Array<SelectedAsset>
) => {
	await saveUserFields(userId, { selectedCurrencies: selectedAssets });
};
