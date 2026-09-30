import type { OAuthCredential } from 'firebase/auth';

import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';

import { classifyLinkError, GENERIC_LINK_ERROR, signInErrorMessage } from './authErrors';

const credential = { providerId: 'google.com' } as OAuthCredential;
const withCredential = () => credential;
const withoutCredential = () => null;

const firebaseError = (code: string, email?: string) =>
	new FirebaseError(code, 'test', email ? { email } : undefined);

describe('classifyLinkError', () => {
	it('treats a closed popup as cancelled, not as an error', () => {
		expect(classifyLinkError(firebaseError('auth/popup-closed-by-user'))).toEqual({
			status: 'cancelled',
		});
		expect(classifyLinkError(firebaseError('auth/cancelled-popup-request'))).toEqual({
			status: 'cancelled',
		});
	});

	it('recognizes a Google account that is already in use', () => {
		const result = classifyLinkError(
			firebaseError('auth/credential-already-in-use', 'me@example.com'),
			withCredential
		);

		expect(result).toEqual({ credential, email: 'me@example.com', status: 'account-exists' });
	});

	it('falls back to a safe error when the existing account has no usable credential', () => {
		const result = classifyLinkError(
			firebaseError('auth/credential-already-in-use'),
			withoutCredential
		);

		expect(result).toEqual({ message: GENERIC_LINK_ERROR, status: 'error' });
	});

	it('explains a blocked popup', () => {
		const result = classifyLinkError(firebaseError('auth/popup-blocked'));

		expect(result.status === 'error' && result.message).toMatch(/blocked the sign-in window/);
	});

	it('gives a generic message for anything else', () => {
		expect(classifyLinkError(new Error('network'))).toEqual({
			message: GENERIC_LINK_ERROR,
			status: 'error',
		});
		expect(classifyLinkError(firebaseError('auth/internal-error'))).toEqual({
			message: GENERIC_LINK_ERROR,
			status: 'error',
		});
	});
});

describe('signInErrorMessage', () => {
	it('stays silent when the user closed the popup', () => {
		expect(signInErrorMessage(firebaseError('auth/popup-closed-by-user'))).toBeNull();
	});

	it('explains blocked popups and network problems', () => {
		expect(signInErrorMessage(firebaseError('auth/popup-blocked'))).toMatch(
			/blocked the sign-in window/
		);
		expect(signInErrorMessage(firebaseError('auth/network-request-failed'))).toMatch(/connection/);
	});

	it('has a generic message for anything else', () => {
		expect(signInErrorMessage(new Error('boom'))).toMatch(/didn't work/);
	});
});
