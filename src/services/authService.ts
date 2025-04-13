import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';

/**
 * Sign in with Google using a popup.
 */
export const signInWithGoogle = async () => {
	try {
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		// The Auth Context will handle updating the user state
		console.log('Google Sign-In successful:', result.user);
	} catch (error) {
		if (error instanceof FirebaseError) {
			console.error('Error during Google Sign-In:', error.message);
		} else if (error instanceof Error) {
			console.error('Error during Google Sign-In:', error.message);
		} else {
			console.error('Unknown error during Google Sign-In');
		}
		// Handle Errors here.
		// You can show error messages to users if needed.
	}
};

/**
 * Sign in anonymously.
 */
export const signInAnonymouslyUser = async () => {
	try {
		const result = await signInAnonymously(auth);
		// The Auth Context will handle updating the user state
		console.log('Anonymous Sign-In successful:', result.user);
	} catch (error) {
		if (error instanceof FirebaseError) {
			console.error('Error during Anonymous Sign-In:', error.message);
		} else if (error instanceof Error) {
			console.error('Error during Anonymous Sign-In:', error.message);
		} else {
			console.error('Unknown error during Anonymous Sign-In');
		}
		// Handle Errors here.
		// You can show error messages to users if needed.
	}
};

/**
 * Sign out the current user.
 */
export const signOutUser = async () => {
	try {
		await signOut(auth);
		console.log('User signed out successfully.');
	} catch (error) {
		if (error instanceof FirebaseError) {
			console.error('Error during Sign-Out:', error.message);
		} else if (error instanceof Error) {
			console.error('Error during Sign-Out:', error.message);
		} else {
			console.error('Unknown error during Sign-Out');
		}
		// Handle Errors here.
	}
};
