import { FirebaseError } from 'firebase/app';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	signInAnonymouslyUser: vi.fn(),
	signInWithGoogle: vi.fn(),
	signInWithProvider: vi.fn(),
}));

vi.mock('../services/authService', () => mocks);

/** The tests choose which providers are switched on, independent of the real config */
const providers = vi.hoisted(() => ({
	enabled: ['google.com', 'microsoft.com', 'facebook.com', 'twitter.com'] as Array<string>,
}));
vi.mock('../config/authProviders', async (importOriginal) => ({
	...(await importOriginal<typeof import('../config/authProviders')>()),
	get ENABLED_PROVIDERS() {
		return providers.enabled;
	},
}));

import AuthChoice from './AuthChoice';

const googleButton = () => screen.getByRole('button', { name: /Continue with Google/ });
const anonymousButton = () => screen.getByRole('button', { name: /Continue without an account/ });

describe('AuthChoice', () => {
	beforeEach(() => {
		mocks.signInAnonymouslyUser.mockReset();
		mocks.signInWithGoogle.mockReset();
		mocks.signInWithProvider.mockReset();
		providers.enabled = ['google.com', 'microsoft.com', 'facebook.com', 'twitter.com'];
	});

	it('only shows the providers that are switched on', () => {
		providers.enabled = ['google.com', 'microsoft.com'];
		render(<AuthChoice />);

		expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Continue with Microsoft' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Continue with Facebook' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Continue with X' })).toBeNull();
	});

	it('offers every enabled sign-in option', () => {
		render(<AuthChoice />);

		for (const name of ['Google', 'Microsoft', 'Facebook', 'X']) {
			expect(screen.getByRole('button', { name: `Continue with ${name}` })).toBeTruthy();
		}
	});

	it.each([
		['Microsoft', 'microsoft.com'],
		['Facebook', 'facebook.com'],
		['X', 'twitter.com'],
	])('signs in with %s through its provider', async (name, providerId) => {
		mocks.signInWithProvider.mockResolvedValue(undefined);
		render(<AuthChoice />);

		fireEvent.click(screen.getByRole('button', { name: `Continue with ${name}` }));

		await waitFor(() => {
			expect(mocks.signInWithProvider).toHaveBeenCalledWith(providerId);
		});
		expect(mocks.signInWithGoogle).not.toHaveBeenCalled();
	});

	it('explains when the email already uses another sign-in option', async () => {
		mocks.signInWithProvider.mockRejectedValue(
			new FirebaseError('auth/account-exists-with-different-credential', 'exists')
		);
		render(<AuthChoice />);

		fireEvent.click(screen.getByRole('button', { name: 'Continue with Facebook' }));

		expect((await screen.findByRole('alert')).textContent).toMatch(/different sign-in option/);
	});

	it('signs in with Google', async () => {
		mocks.signInWithGoogle.mockResolvedValue(undefined);
		render(<AuthChoice />);

		fireEvent.click(googleButton());

		await waitFor(() => {
			expect(mocks.signInWithGoogle).toHaveBeenCalledOnce();
		});
		expect(mocks.signInAnonymouslyUser).not.toHaveBeenCalled();
	});

	it('continues without an account', async () => {
		mocks.signInAnonymouslyUser.mockResolvedValue(undefined);
		render(<AuthChoice />);

		fireEvent.click(anonymousButton());

		await waitFor(() => {
			expect(mocks.signInAnonymouslyUser).toHaveBeenCalledOnce();
		});
	});

	it('disables both options while signing in', () => {
		mocks.signInWithGoogle.mockReturnValue(new Promise(() => {}));
		render(<AuthChoice />);

		fireEvent.click(googleButton());

		expect(googleButton().hasAttribute('disabled')).toBe(true);
		expect(anonymousButton().hasAttribute('disabled')).toBe(true);
	});

	it('shows an error and lets you try again', async () => {
		mocks.signInWithGoogle.mockRejectedValue(new FirebaseError('auth/popup-blocked', 'blocked'));
		render(<AuthChoice />);

		fireEvent.click(googleButton());

		expect((await screen.findByRole('alert')).textContent).toMatch(/blocked the sign-in window/);
		expect(googleButton().hasAttribute('disabled')).toBe(false);
	});

	it('stays quiet when the popup is closed', async () => {
		mocks.signInWithGoogle.mockRejectedValue(
			new FirebaseError('auth/popup-closed-by-user', 'closed')
		);
		render(<AuthChoice />);

		fireEvent.click(googleButton());

		await waitFor(() => {
			expect(googleButton().hasAttribute('disabled')).toBe(false);
		});
		expect(screen.queryByRole('alert')).toBeNull();
	});
});
