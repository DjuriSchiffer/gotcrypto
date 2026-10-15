import {
	deleteUser,
	GoogleAuthProvider,
	reauthenticateWithPopup,
	signInAnonymously,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import { deleteDoc } from 'firebase/firestore';
import localforage from 'localforage';

import { auth } from '../firebase/firebaseConfig';
import { getUserDocRef } from '../firebase/firebaseHelpers';
import { LOCAL_PORTFOLIO_KEY, PREFERENCE_KEYS } from '../utils/preferences';

/**
 * Google sign-in that always shows the account chooser, so Google never silently
 * reuses the last account, e.g. when someone else uses the same computer.
 */
export const googleProvider = () => {
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({ prompt: 'select_account' });
	return provider;
};

/** Throws on failure, so the UI can show what went wrong (see signInErrorMessage). */
export const signInWithGoogle = async () => {
	await signInWithPopup(auth, googleProvider());
};

/** Throws on failure, so the UI can show what went wrong (see signInErrorMessage). */
export const signInAnonymouslyUser = async () => {
	await signInAnonymously(auth);
};

export const signOutUser = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error('Error during sign-out:', error);
	}
};

/** Removes the portfolio and preferences an anonymous session keeps in this browser. */
const clearBrowserData = async () => {
	await Promise.all(
		[LOCAL_PORTFOLIO_KEY, ...PREFERENCE_KEYS].map((key) => localforage.removeItem(key))
	);
};

/**
 * Deletes everything of the current user, then the login itself. Afterwards nobody is signed in,
 * so the app shows the sign-in screen by itself (onAuthStateChanged).
 *
 * - Google account: first asks the user to pick their Google account again. Firebase only deletes
 *   a login right after signing in, and it confirms it's really them. Then deletes their Firestore
 *   document (portfolio and preferences).
 * - Anonymous session: deletes the portfolio and preferences stored in this browser.
 *
 * Throws on failure (see deleteAccountErrorMessage). If the user cancels the Google window,
 * nothing has been deleted yet.
 */
export const deleteAccount = async (): Promise<void> => {
	const user = auth.currentUser;
	if (!user) throw new Error('Nobody is signed in');

	if (user.isAnonymous) {
		await clearBrowserData();
	} else {
		await reauthenticateWithPopup(user, googleProvider());
		await deleteDoc(getUserDocRef(user.uid));
	}

	try {
		await deleteUser(user);
	} catch (error) {
		// An old anonymous session can't sign in again to confirm. Its data is already gone and the
		// login itself holds nothing personal, so signing out is enough.
		if (user.isAnonymous) {
			await signOut(auth);
			return;
		}
		throw error;
	}
};
