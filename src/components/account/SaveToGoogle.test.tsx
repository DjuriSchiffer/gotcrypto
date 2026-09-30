import type { OAuthCredential } from 'firebase/auth';

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	copyLocalPortfolio: vi.fn(),
	refreshAuth: vi.fn(),
	reload: vi.fn(),
	signInToExistingAccount: vi.fn(),
	upgradeAnonymousAccount: vi.fn(),
}));

vi.mock('../../services/accountUpgrade', () => ({
	copyLocalPortfolio: mocks.copyLocalPortfolio,
	signInToExistingAccount: mocks.signInToExistingAccount,
	upgradeAnonymousAccount: mocks.upgradeAnonymousAccount,
}));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ refreshAuth: mocks.refreshAuth }) }));
vi.mock('../../hooks/useStorage', () => ({ useStorage: () => ({ reload: mocks.reload }) }));
vi.mock('../../firebase/firebaseConfig', () => ({ auth: { currentUser: { uid: 'anon-uid' } } }));

import SaveToGoogle from './SaveToGoolge';

const credential = { providerId: 'google.com' } as OAuthCredential;
const clickSave = () =>
	fireEvent.click(screen.getByRole('button', { name: /Save to a Google account/ }));

describe('SaveToGoogle', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks)) mock.mockReset();
	});

	it('switches the app to the Google account after a successful upgrade', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ migratedAssets: 3, status: 'linked' });
		render(<SaveToGoogle />);

		clickSave();

		await waitFor(() => expect(mocks.refreshAuth).toHaveBeenCalledOnce());
	});

	it('does nothing when the popup is closed', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ status: 'cancelled' });
		render(<SaveToGoogle />);

		clickSave();

		await waitFor(() =>
			expect(
				screen.getByRole('button', { name: /Save to a Google account/ }).hasAttribute('disabled')
			).toBe(false)
		);
		expect(mocks.refreshAuth).not.toHaveBeenCalled();
		expect(screen.queryByRole('alert')).toBeNull();
	});

	describe('when the Google account is already in use', () => {
		beforeEach(() => {
			mocks.upgradeAnonymousAccount.mockResolvedValue({
				credential,
				email: 'me@example.com',
				status: 'account-exists',
			});
		});

		it('explains the situation before doing anything', async () => {
			render(<SaveToGoogle />);
			clickSave();

			const dialog = within(await screen.findByRole('dialog'));
			expect(dialog.getByText('me@example.com')).toBeTruthy();
			expect(dialog.getByText(/nothing is copied or merged/)).toBeTruthy();
			expect(mocks.signInToExistingAccount).not.toHaveBeenCalled();
			expect(mocks.copyLocalPortfolio).not.toHaveBeenCalled();
		});

		it('stays anonymous without touching either portfolio', async () => {
			render(<SaveToGoogle />);
			clickSave();

			fireEvent.click(
				within(await screen.findByRole('dialog')).getByRole('button', { name: 'Stay anonymous' })
			);

			expect(mocks.signInToExistingAccount).not.toHaveBeenCalled();
			expect(mocks.copyLocalPortfolio).not.toHaveBeenCalled();
			expect(mocks.refreshAuth).not.toHaveBeenCalled();
		});

		const signInToExisting = async () => {
			render(<SaveToGoogle />);
			clickSave();
			fireEvent.click(
				within(await screen.findByRole('dialog')).getByRole('button', {
					name: 'Sign in to that account',
				})
			);
			await waitFor(() => expect(mocks.signInToExistingAccount).toHaveBeenCalledWith(credential));
		};

		it('reloads to show the portfolio that moved into an empty account', async () => {
			mocks.signInToExistingAccount.mockResolvedValue({ fields: {}, kind: 'write' });
			await signInToExisting();

			await waitFor(() => expect(mocks.reload).toHaveBeenCalledOnce());
		});

		it('leaves an account with a portfolio as it is', async () => {
			mocks.signInToExistingAccount.mockResolvedValue({
				kind: 'skip',
				reason: 'account-has-portfolio',
			});
			await signInToExisting();

			expect(mocks.reload).not.toHaveBeenCalled();
		});

		it('does not reload when copying failed', async () => {
			mocks.signInToExistingAccount.mockResolvedValue(null);
			await signInToExisting();

			expect(mocks.reload).not.toHaveBeenCalled();
		});
	});

	it('shows an error and keeps the session', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ message: 'Popup blocked', status: 'error' });
		render(<SaveToGoogle />);

		clickSave();

		expect((await screen.findByRole('alert')).textContent).toContain('Popup blocked');
		expect(mocks.refreshAuth).not.toHaveBeenCalled();
	});

	it('lets you retry when copying failed, and only then switches accounts', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ status: 'copy-failed' });
		mocks.copyLocalPortfolio.mockResolvedValue({ fields: {}, kind: 'write' });
		render(<SaveToGoogle />);

		clickSave();
		expect((await screen.findByRole('alert')).textContent).toMatch(/still safe in this browser/);
		expect(mocks.refreshAuth).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

		await waitFor(() => expect(mocks.refreshAuth).toHaveBeenCalledOnce());
		expect(mocks.copyLocalPortfolio).toHaveBeenCalledWith('anon-uid');
	});
});
