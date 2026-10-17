import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';

import { classifyLinkError, signInErrorMessage } from './authErrors';
import { primaryProvider } from './signInMethod';

describe('primaryProvider', () => {
	it('knows anonymous sessions and each provider', () => {
		expect(primaryProvider({ isAnonymous: true })).toBe('anonymous');
		expect(primaryProvider({ providerData: [{ providerId: 'microsoft.com' }] })).toBe('microsoft.com');
		expect(primaryProvider({ providerData: [{ providerId: 'facebook.com' }] })).toBe('facebook.com');
		expect(primaryProvider({ providerData: [{ providerId: 'twitter.com' }] })).toBe('twitter.com');
	});

	it('skips providers the app does not know, and falls back to Google', () => {
		expect(
			primaryProvider({ providerData: [{ providerId: 'password' }, { providerId: 'twitter.com' }] })
		).toBe('twitter.com');
		expect(primaryProvider({})).toBe('google.com');
	});
});

describe('sign-in errors for the extra providers', () => {
	it('explains that the email already signs in another way', () => {
		const error = new FirebaseError('auth/account-exists-with-different-credential', 'exists');

		expect(signInErrorMessage(error)).toMatch(/different sign-in option/);
		const result = classifyLinkError(error);
		expect(result.status).toBe('error');
		expect(result.status === 'error' ? result.message : '').toMatch(/Your data is unchanged/);
	});

	it("explains a provider that isn't switched on yet", () => {
		const error = new FirebaseError('auth/operation-not-allowed', 'off');

		expect(signInErrorMessage(error)).toMatch(/isn't switched on yet/);
		expect(classifyLinkError(error)).toMatchObject({ status: 'error' });
	});
});
