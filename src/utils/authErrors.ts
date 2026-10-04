import type { OAuthCredential } from 'firebase/auth';

import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider } from 'firebase/auth';

export type LinkFailure =
	| { credential: OAuthCredential; email: null | string; status: 'account-exists' }
	| { message: string; status: 'error' }
	| { status: 'cancelled' };

const CANCELLED_CODES = new Set([
	'auth/cancelled-popup-request',
	'auth/popup-closed-by-user',
	'auth/user-cancelled',
]);

const ACCOUNT_EXISTS_CODES = new Set([
	'auth/credential-already-in-use',
	'auth/email-already-in-use',
]);

export const GENERIC_LINK_ERROR =
	'Something went wrong while connecting your Google account. Your data is unchanged.';

const POPUP_BLOCKED_MESSAGE =
	'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.';

/**
 * Turns a failed linkWithPopup into something the UI can act on.
 * `getCredential` is injectable so this can be tested without a real Firebase error.
 */
export const classifyLinkError = (
	error: unknown,
	getCredential: (error: FirebaseError) => null | OAuthCredential = (firebaseError) =>
		GoogleAuthProvider.credentialFromError(firebaseError)
): LinkFailure => {
	if (!(error instanceof FirebaseError)) {
		return { message: GENERIC_LINK_ERROR, status: 'error' };
	}

	if (CANCELLED_CODES.has(error.code)) {
		return { status: 'cancelled' };
	}

	if (ACCOUNT_EXISTS_CODES.has(error.code)) {
		const credential = getCredential(error);
		if (credential) {
			const email = typeof error.customData?.email === 'string' ? error.customData.email : null;
			return { credential, email, status: 'account-exists' };
		}
	}

	if (error.code === 'auth/popup-blocked') {
		return {
			message: POPUP_BLOCKED_MESSAGE,
			status: 'error',
		};
	}

	return { message: GENERIC_LINK_ERROR, status: 'error' };
};

/**
 * A user-facing message for a failed sign-in, or null when there's nothing to report
 * (the user closed the popup themselves).
 */
export const signInErrorMessage = (error: unknown): null | string => {
	if (error instanceof FirebaseError) {
		if (CANCELLED_CODES.has(error.code)) return null;
		if (error.code === 'auth/popup-blocked') {
			return POPUP_BLOCKED_MESSAGE;
		}
		if (error.code === 'auth/network-request-failed') {
			return "Couldn't reach the sign-in service. Check your connection and try again.";
		}
	}
	return "Signing in didn't work. Please try again.";
};
