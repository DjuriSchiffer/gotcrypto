import { GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';

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
