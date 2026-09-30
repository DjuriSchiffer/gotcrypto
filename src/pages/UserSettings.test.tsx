import type { ReactNode } from 'react';

import type { SelectedAsset } from '../types/currency';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { asset, buy } from '../test/factories';

const mocks = vi.hoisted(() => ({
	auth: {
		isAnonymous: false,
		user: { displayName: 'Henk', email: 'henk@example.com', photoURL: null },
	},
	selectedCurrencies: [] as Array<SelectedAsset>,
	setSelectedCurrencies: vi.fn(),
	signOutUser: vi.fn(),
}));

vi.mock('../components/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
// The selectors are tested through the app itself; here they only need to render
vi.mock('../components/SettingsPriceFormat', () => ({
	default: () => <div>currency options</div>,
}));
vi.mock('../components/SettingsDateFormat', () => ({ default: () => <div>date options</div> }));
vi.mock('../components/SettingsLightDarkMode', () => ({ default: () => <div>theme options</div> }));
vi.mock('../components/account/SaveToGoogle', () => ({
	default: () => <button type="button">Save to a Google account</button>,
}));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('../hooks/useStorage', () => ({
	useStorage: () => ({
		selectedCurrencies: mocks.selectedCurrencies,
		setSelectedCurrencies: mocks.setSelectedCurrencies,
	}),
}));
vi.mock('../services/authService', () => ({ signOutUser: mocks.signOutUser }));

import UserSettings from './UserSettings';

describe('Settings page', () => {
	beforeEach(() => {
		mocks.setSelectedCurrencies.mockReset();
		mocks.signOutUser.mockReset();
		mocks.auth.isAnonymous = false;
		mocks.selectedCurrencies = [
			asset(1, [buy(1, 100), buy(1, 200)], 'Bitcoin'),
			asset(2, [buy(1, 50)], 'Ethereum'),
		];
	});

	it('shows every section', () => {
		render(<UserSettings />);

		for (const title of ['Account', 'Currency', 'Date format', 'Appearance', 'Danger zone']) {
			expect(screen.getByRole('heading', { name: title })).toBeTruthy();
		}
		expect(screen.getByText('Synced with Google')).toBeTruthy();
		expect(screen.getByText('henk@example.com')).toBeTruthy();
	});

	it('warns anonymous users that their data is only in this browser', () => {
		mocks.auth.isAnonymous = true;
		render(<UserSettings />);

		expect(screen.getByText('Anonymous session')).toBeTruthy();
		expect(screen.getByText(/stored in this browser only/)).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Save to a Google account' })).toBeTruthy();
	});

	it('does not offer saving to Google when already signed in', () => {
		render(<UserSettings />);

		expect(screen.queryByRole('button', { name: 'Save to a Google account' })).toBeNull();
	});

	it('signs out', () => {
		render(<UserSettings />);
		fireEvent.click(screen.getByRole('button', { name: /Sign out/ }));

		expect(mocks.signOutUser).toHaveBeenCalledOnce();
	});

	it('only deletes the portfolio after typing DELETE', () => {
		render(<UserSettings />);
		fireEvent.click(screen.getByRole('button', { name: /Delete portfolio data/ }));

		const dialog = within(screen.getByRole('dialog'));
		expect(dialog.getByText('2 assets and 3 transactions')).toBeTruthy();

		const confirm = dialog.getByRole('button', { name: 'Delete portfolio data' });
		fireEvent.change(dialog.getByLabelText(/to confirm/), { target: { value: 'delete' } });
		expect(confirm.hasAttribute('disabled')).toBe(true); // case matters

		fireEvent.change(dialog.getByLabelText(/to confirm/), { target: { value: 'DELETE' } });
		fireEvent.click(confirm);

		expect(mocks.setSelectedCurrencies).toHaveBeenCalledWith([]);
	});

	it('disables deleting when there is nothing to delete', () => {
		mocks.selectedCurrencies = [];
		render(<UserSettings />);

		expect(
			screen.getByRole('button', { name: /Delete portfolio data/ }).hasAttribute('disabled')
		).toBe(true);
	});
});
