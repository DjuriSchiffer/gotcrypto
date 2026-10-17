import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type TestUser = { email: string; providerData?: Array<{ providerId: string }> };

const mocks = vi.hoisted(() => ({
	auth: { isAnonymous: false, user: null as null | TestUser },
	deleteAccount: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('../../services/authService', () => ({ deleteAccount: mocks.deleteAccount }));

import DeleteAccount from './DeleteAccount';

const confirmWith = (word: string) => {
	fireEvent.click(screen.getByRole('button', { name: /Delete account/ }));
	fireEvent.change(screen.getByLabelText(/to confirm/), { target: { value: word } });
	const buttons = screen.getAllByRole('button', { name: 'Delete account' });
	fireEvent.click(buttons[buttons.length - 1]);
};

describe('DeleteAccount', () => {
	beforeEach(() => {
		mocks.auth.isAnonymous = false;
		mocks.auth.user = { email: 'me@example.com' };
		mocks.deleteAccount.mockReset();
	});

	it('only deletes after typing DELETE', () => {
		render(<DeleteAccount />);
		fireEvent.click(screen.getByRole('button', { name: /Delete account/ }));
		fireEvent.change(screen.getByLabelText(/to confirm/), { target: { value: 'delete' } });

		const buttons = screen.getAllByRole('button', { name: 'Delete account' });
		expect(buttons[buttons.length - 1].hasAttribute('disabled')).toBe(true);
		expect(mocks.deleteAccount).not.toHaveBeenCalled();
	});

	it('deletes the account once confirmed', async () => {
		mocks.deleteAccount.mockResolvedValue(undefined);
		render(<DeleteAccount />);

		confirmWith('DELETE');

		await waitFor(() => {
			expect(mocks.deleteAccount).toHaveBeenCalledOnce();
		});
	});

	it('tells Google users they must confirm with their account, and which one', () => {
		render(<DeleteAccount />);
		fireEvent.click(screen.getByRole('button', { name: /Delete account/ }));

		expect(screen.getByText('me@example.com')).toBeTruthy();
		expect(screen.getByText(/sign in with Google once more/)).toBeTruthy();
	});

	it('names the provider the user signs in with', () => {
		mocks.auth.user = { email: 'me@example.com', providerData: [{ providerId: 'microsoft.com' }] };
		render(<DeleteAccount />);
		fireEvent.click(screen.getByRole('button', { name: /Delete account/ }));

		expect(screen.getByText(/sign in with Microsoft once more/)).toBeTruthy();
	});

	it('shows what went wrong', async () => {
		mocks.deleteAccount.mockRejectedValue(
			Object.assign(new Error('mismatch'), { code: 'auth/user-mismatch' })
		);
		render(<DeleteAccount />);

		confirmWith('DELETE');

		expect(await screen.findByText(/Choose me@example.com to confirm/)).toBeTruthy();
	});

	it('shows nothing when the user closed the Google window', async () => {
		mocks.deleteAccount.mockRejectedValue(
			Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' })
		);
		render(<DeleteAccount />);

		confirmWith('DELETE');

		await waitFor(() => {
			expect(screen.getByRole('button', { name: /Delete account/ }).hasAttribute('disabled')).toBe(
				false
			);
		});
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('explains that an anonymous session lives in this browser', () => {
		mocks.auth.isAnonymous = true;
		render(<DeleteAccount />);

		expect(screen.getByText(/from this browser and ends this session/)).toBeTruthy();
	});
});
