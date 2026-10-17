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

/** The tests choose which providers are switched on, independent of the real config */
const providers = vi.hoisted(() => ({
	enabled: ['google.com', 'microsoft.com', 'facebook.com', 'twitter.com'] as Array<string>,
}));
vi.mock('../../config/authProviders', async (importOriginal) => ({
	...(await importOriginal()),
	get ENABLED_PROVIDERS() {
		return providers.enabled;
	},
}));

import SaveToAccount from './SaveToAccount';

const credential = { providerId: 'google.com' } as OAuthCredential;
const saveButton = (name = 'Google') => screen.getByRole('button', { name: `Save to ${name}` });
const clickSave = (name = 'Google') => {
	fireEvent.click(saveButton(name));
};

describe('SaveToAccount', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks)) mock.mockReset();
		providers.enabled = ['google.com', 'microsoft.com', 'facebook.com', 'twitter.com'];
	});

	it('only offers the providers that are switched on', () => {
		providers.enabled = ['google.com'];
		render(<SaveToAccount />);

		expect(saveButton('Google')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Save to Microsoft' })).toBeNull();
	});

	it('offers every enabled account type', () => {
		render(<SaveToAccount />);

		for (const name of ['Google', 'Microsoft', 'Facebook', 'X']) {
			expect(saveButton(name)).toBeTruthy();
		}
	});

	it('saves to the account type you pick, and names it when that account is in use', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({
			credential,
			email: 'me@example.com',
			status: 'account-exists',
		});
		render(<SaveToAccount />);

		clickSave('Microsoft');

		expect(await screen.findByText('This Microsoft account is already in use')).toBeTruthy();
		expect(mocks.upgradeAnonymousAccount).toHaveBeenCalledWith('microsoft.com');
	});

	it('switches the app to the Google account after a successful upgrade', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ migratedAssets: 3, status: 'linked' });
		render(<SaveToAccount />);

		clickSave();

		await waitFor(() => {
			expect(mocks.refreshAuth).toHaveBeenCalledOnce();
		});
	});

	it('does nothing when the popup is closed', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ status: 'cancelled' });
		render(<SaveToAccount />);

		clickSave();

		await waitFor(() => {
			expect(saveButton().hasAttribute('disabled')).toBe(false);
		});
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
			render(<SaveToAccount />);
			clickSave();

			const dialog = within(await screen.findByRole('dialog'));
			expect(dialog.getByText('me@example.com')).toBeTruthy();
			expect(dialog.getByText(/nothing is copied or merged/)).toBeTruthy();
			expect(mocks.signInToExistingAccount).not.toHaveBeenCalled();
			expect(mocks.copyLocalPortfolio).not.toHaveBeenCalled();
		});

		it('stays anonymous without touching either portfolio', async () => {
			render(<SaveToAccount />);
			clickSave();

			fireEvent.click(
				within(await screen.findByRole('dialog')).getByRole('button', { name: 'Stay anonymous' })
			);

			expect(mocks.signInToExistingAccount).not.toHaveBeenCalled();
			expect(mocks.copyLocalPortfolio).not.toHaveBeenCalled();
			expect(mocks.refreshAuth).not.toHaveBeenCalled();
		});

		const signInToExisting = async () => {
			render(<SaveToAccount />);
			clickSave();
			fireEvent.click(
				within(await screen.findByRole('dialog')).getByRole('button', {
					name: 'Sign in to that account',
				})
			);
			await waitFor(() => {
				expect(mocks.signInToExistingAccount).toHaveBeenCalledWith(credential);
			});
		};

		it('reloads to show the portfolio that moved into an empty account', async () => {
			mocks.signInToExistingAccount.mockResolvedValue({ fields: {}, kind: 'write' });
			await signInToExisting();

			await waitFor(() => {
				expect(mocks.reload).toHaveBeenCalledOnce();
			});
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
		render(<SaveToAccount />);

		clickSave();

		expect((await screen.findByRole('alert')).textContent).toContain('Popup blocked');
		expect(mocks.refreshAuth).not.toHaveBeenCalled();
	});

	it('lets you retry when copying failed, and only then switches accounts', async () => {
		mocks.upgradeAnonymousAccount.mockResolvedValue({ status: 'copy-failed' });
		mocks.copyLocalPortfolio.mockResolvedValue({ fields: {}, kind: 'write' });
		render(<SaveToAccount />);

		clickSave();
		expect((await screen.findByRole('alert')).textContent).toMatch(/still safe in this browser/);
		expect(mocks.refreshAuth).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

		await waitFor(() => {
			expect(mocks.refreshAuth).toHaveBeenCalledOnce();
		});
		expect(mocks.copyLocalPortfolio).toHaveBeenCalledWith('anon-uid');
	});
});
