import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	signInAnonymouslyUser: vi.fn(),
	signInWithGoogle: vi.fn(),
}));

vi.mock('../services/authService', () => mocks);

import AuthChoice from './AuthChoice';

const googleButton = () => screen.getByRole('button', { name: /Continue with Google/ });
const anonymousButton = () => screen.getByRole('button', { name: /Continue without an account/ });

describe('AuthChoice', () => {
	beforeEach(() => {
		mocks.signInAnonymouslyUser.mockReset();
		mocks.signInWithGoogle.mockReset();
	});

	it('signs in with Google', async () => {
		mocks.signInWithGoogle.mockResolvedValue(undefined);
		render(<AuthChoice />);

		fireEvent.click(googleButton());

		await waitFor(() => expect(mocks.signInWithGoogle).toHaveBeenCalledOnce());
		expect(mocks.signInAnonymouslyUser).not.toHaveBeenCalled();
	});

	it('continues without an account', async () => {
		mocks.signInAnonymouslyUser.mockResolvedValue(undefined);
		render(<AuthChoice />);

		fireEvent.click(anonymousButton());

		await waitFor(() => expect(mocks.signInAnonymouslyUser).toHaveBeenCalledOnce());
	});

	it('disables both options while signing in', () => {
		mocks.signInWithGoogle.mockReturnValue(
			new Promise(() => {
				// Never settles: keeps the sign-in pending for the duration of this test
			})
		);
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

		await waitFor(() => expect(googleButton().hasAttribute('disabled')).toBe(false));
		expect(screen.queryByRole('alert')).toBeNull();
	});
});
