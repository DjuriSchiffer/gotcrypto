import { describe, expect, it } from 'vitest';

import { deleteAccountErrorMessage } from './accountDeletion';

const error = (code: string) => Object.assign(new Error(code), { code });

describe('deleteAccountErrorMessage', () => {
	it('says nothing when the user closed the Google window', () => {
		expect(deleteAccountErrorMessage(error('auth/popup-closed-by-user'), null)).toBeNull();
		expect(deleteAccountErrorMessage(error('auth/cancelled-popup-request'), null)).toBeNull();
	});

	it('names the account to pick when the wrong one was chosen', () => {
		expect(deleteAccountErrorMessage(error('auth/user-mismatch'), 'me@example.com')).toBe(
			"That's a different Google account. Choose me@example.com to confirm."
		);
	});

	it('explains a blocked pop-up and a network problem', () => {
		expect(deleteAccountErrorMessage(error('auth/popup-blocked'), null)).toContain('Allow pop-ups');
		expect(deleteAccountErrorMessage(error('auth/network-request-failed'), null)).toContain(
			'connection'
		);
	});

	it('falls back to a general message', () => {
		expect(deleteAccountErrorMessage(new Error('boom'), null)).toBe(
			'Your account could not be deleted completely. Please try again.'
		);
		expect(deleteAccountErrorMessage('not even an error', null)).toContain('Please try again');
	});
});
