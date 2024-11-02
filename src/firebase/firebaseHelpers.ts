import { db } from '../firebase/firebaseConfig';

import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { SelectedAsset } from 'currency';

export const getUserDocRef = (userId: string) => doc(db, 'users', userId);

/**
 * Fetch selectedCurrencies from Firestore for a specific user.
 */
export const fetchSelectedCurrenciesFromFirestore = async (
  userId: string
): Promise<SelectedAsset[]> => {
  const userDocRef = getUserDocRef(userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data().selectedCurrencies || [];
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
  selectedAssets: SelectedAsset[]
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
