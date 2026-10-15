const errorCode = (error: unknown): string | undefined =>
	typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
		? error.code
		: undefined;

/**
 * What to tell the user when deleting their account failed.
 * Returns null when they closed the Google window themselves: nothing to report then.
 */
export const deleteAccountErrorMessage = (error: unknown, email: null | string): null | string => {
	switch (errorCode(error)) {
		case 'auth/cancelled-popup-request':
		case 'auth/popup-closed-by-user':
			return null;
		case 'auth/network-request-failed':
			return "Couldn't reach the server. Check your connection and try again.";
		case 'auth/popup-blocked':
			return 'Your browser blocked the Google window. Allow pop-ups for this site and try again.';
		case 'auth/user-mismatch':
			return email
				? `That's a different Google account. Choose ${email} to confirm.`
				: "That's a different Google account. Choose the one you're signed in with.";
		case undefined:
		default:
			return 'Your account could not be deleted completely. Please try again.';
	}
};
