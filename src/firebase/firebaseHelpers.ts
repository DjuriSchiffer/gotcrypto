import type { SelectedAsset } from 'currency';

import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export const getUserDocRef = (userId: string) => doc(db, 'users', userId);

/**
 * Fetch selectedCurrencies from Firestore for a specific user.
 */
export const fetchSelectedCurrenciesFromFirestore = async (
  userId: string
): Promise<Array<SelectedAsset>> => {
  const userDocRef = getUserDocRef(userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const data = userDoc.data();
    // Type assertion to ensure we're returning the correct type
    return (data.selectedCurrencies || []) as Array<SelectedAsset>;
  } else {
    // Initialize the document with an empty array
    await setDoc(userDocRef, { selectedCurrencies: [] });
    return [];
  }
};

/**
 * Set selectedCurrencies in Firestore for a specific user.
 */
export const setSelectedCurrenciesInFirestore = async (
  userId: string,
  selectedAssets: Array<SelectedAsset>
) => {
  const userDocRef = getUserDocRef(userId);
  await setDoc(userDocRef, { selectedCurrencies: selectedAssets }, { merge: true });
};

/**
 * Update selectedCurrencies in Firestore for a specific user.
 */
export const updateSelectedCurrencyInFirestore = async (
  userId: string,
  asset: SelectedAsset
) => {
  const userDocRef = getUserDocRef(userId);
  await updateDoc(userDocRef, {
    selectedCurrencies: arrayUnion(asset),
  });
};