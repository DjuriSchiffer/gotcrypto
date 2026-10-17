import type { FirebaseError } from 'firebase/app';
import type { AuthProvider, OAuthCredential } from 'firebase/auth';

import {
	deleteUser,
	FacebookAuthProvider,
	GoogleAuthProvider,
	OAuthProvider,
	reauthenticateWithPopup,
	signInAnonymously,
	signInWithPopup,
	signOut,
	TwitterAuthProvider,
} from 'firebase/auth';
import { deleteDoc } from 'firebase/firestore';
import localforage from 'localforage';

import type { ProviderId } from '../config/authProviders';

import { auth } from '../firebase/firebaseConfig';
import { getUserDocRef } from '../firebase/firebaseHelpers';
import { LOCAL_PORTFOLIO_KEY, PREFERENCE_KEYS } from '../utils/preferences';
import { primaryProvider } from '../utils/signInMethod';

/**
 * Google sign-in that always shows the account chooser, so Google never silently
 * reuses the last account, e.g. when someone else uses the same computer.
 */
export const googleProvider = () => {
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({ prompt: 'select_account' });
	return provider;
};

/**
 * The Firebase provider for a sign-in option. Where the provider supports it, it always shows
 * the account chooser, so a shared computer never silently reuses someone else's account.
 */
export const createProvider = (id: ProviderId): AuthProvider => {
	switch (id) {
		case 'facebook.com': {
			const provider = new FacebookAuthProvider();
			provider.addScope('email');
			return provider;
		}
		case 'google.com':
			return googleProvider();
		case 'microsoft.com': {
			const provider = new OAuthProvider('microsoft.com');
			provider.setCustomParameters({ prompt: 'select_account' });
			return provider;
		}
		case 'twitter.com':
			return new TwitterAuthProvider();
	}
};

/** The credential inside a failed sign-in or link, so the user can continue with that account. */
export const credentialFromError = (
	id: ProviderId,
	error: FirebaseError
): null | OAuthCredential => {
	switch (id) {
		case 'facebook.com':
			return FacebookAuthProvider.credentialFromError(error);
		case 'google.com':
			return GoogleAuthProvider.credentialFromError(error);
		case 'microsoft.com':
			return OAuthProvider.credentialFromError(error);
		case 'twitter.com':
			return TwitterAuthProvider.credentialFromError(error);
	}
};

/** Throws on failure, so the UI can show what went wrong (see signInErrorMessage). */
export const signInWithProvider = async (id: ProviderId) => {
	await signInWithPopup(auth, createProvider(id));
};

/** Throws on failure, so the UI can show what went wrong (see signInErrorMessage). */
export const signInWithGoogle = async () => {
	await signInWithProvider('google.com');
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
 * - Google, Microsoft, Facebook or X: first asks the user to sign in with it again. Firebase only
 *   deletes a login right after signing in, and it confirms it's really them. Then deletes their
 *   Firestore document (portfolio and preferences).
 * - Anonymous session: deletes the portfolio and preferences stored in this browser.
 *
 * Throws on failure (see deleteAccountErrorMessage). If the user cancels the Google window,
 * nothing has been deleted yet.
 */
export const deleteAccount = async (): Promise<void> => {
	const user = auth.currentUser;
	if (!user) throw new Error('Nobody is signed in');

	const provider = primaryProvider(user);
	if (provider === 'anonymous') {
		await clearBrowserData();
	} else {
		await reauthenticateWithPopup(user, createProvider(provider));
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
