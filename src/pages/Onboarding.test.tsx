import type { SelectedAsset } from '../types/currency';

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	selectedCurrencies: [] as Array<SelectedAsset>,
	setOnboardingCompleted: vi.fn(),
	setSelectedCurrencies: vi.fn(),
	signOutUser: vi.fn(),
}));

vi.mock('../components/SettingsPriceFormat', () => ({
	default: () => <div>currency options</div>,
}));
vi.mock('../components/SettingsDateFormat', () => ({ default: () => <div>date options</div> }));
vi.mock('../components/SettingsLightDarkMode', () => ({ default: () => <div>theme options</div> }));
vi.mock('../services/authService', () => ({ signOutUser: mocks.signOutUser }));
vi.mock('../hooks/useStorage', () => ({
	useStorage: () => ({
		currencyQuote: 'EUR',
		selectedCurrencies: mocks.selectedCurrencies,
		setOnboardingCompleted: mocks.setOnboardingCompleted,
		setSelectedCurrencies: mocks.setSelectedCurrencies,
	}),
}));
vi.mock('../hooks/useCoinMarketCap', () => ({
	default: () => ({
		data: [
			{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
			{ cmc_id: 2, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
			{ cmc_id: 3, cmc_rank: 3, name: 'Bitcoin Cash', price: 300, slug: 'bitcoin-cash' },
		],
		isLoading: false,
	}),
}));

import OnboardingPage from './Onboarding';

const renderOnboarding = () =>
	render(
		<MemoryRouter initialEntries={['/onboarding']}>
			<Routes>
				<Route element={<OnboardingPage />} path="/onboarding" />
				<Route element={<p>Dashboard home</p>} path="/" />
			</Routes>
		</MemoryRouter>
	);

const coins = () => within(screen.getByRole('group', { name: 'Coins' }));
const next = () => screen.getByRole('button', { name: /Next/ });

describe('Onboarding', () => {
	beforeEach(() => {
		mocks.selectedCurrencies = [];
		mocks.setOnboardingCompleted.mockReset();
		mocks.setSelectedCurrencies.mockReset();
		mocks.signOutUser.mockReset();
	});

	it('requires at least one coin before continuing', () => {
		renderOnboarding();

		expect(next().hasAttribute('disabled')).toBe(true);
		fireEvent.click(coins().getByRole('button', { name: /Ethereum/ }));

		expect(next().hasAttribute('disabled')).toBe(false);
		expect(screen.getByText('1 selected')).toBeTruthy();
	});

	it('searches coins', () => {
		renderOnboarding();
		fireEvent.change(screen.getByRole('searchbox', { name: 'Search coins' }), {
			target: { value: 'bitcoin' },
		});

		expect(
			coins()
				.getAllByRole('button')
				.map((button) => button.textContent)
		).toEqual(['Bitcoin', 'Bitcoin Cash']);
	});

	it('walks through the steps and saves complete assets', async () => {
		renderOnboarding();

		fireEvent.click(coins().getByRole('button', { name: /^Bitcoin$/ }));
		fireEvent.click(coins().getByRole('button', { name: /Ethereum/ }));
		fireEvent.click(next());

		expect(screen.getByRole('heading', { name: 'Set your preferences' })).toBeTruthy();
		fireEvent.click(next());

		expect(screen.getByText('2 coins on your dashboard')).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: /Go to dashboard/ }));

		await waitFor(() => expect(screen.getByText('Dashboard home')).toBeTruthy());

		const saved = mocks.setSelectedCurrencies.mock.calls[0][0] as Array<SelectedAsset>;
		expect(saved.map((asset) => asset.slug)).toEqual(['bitcoin', 'ethereum']);
		expect(mocks.setOnboardingCompleted).toHaveBeenCalledWith(true);
	});

	it('keeps the selection when going back', () => {
		renderOnboarding();

		fireEvent.click(coins().getByRole('button', { name: /Ethereum/ }));
		fireEvent.click(next());
		fireEvent.click(screen.getByRole('button', { name: /Back/ }));

		expect(
			coins()
				.getByRole('button', { name: /Ethereum/ })
				.getAttribute('aria-pressed')
		).toBe('true');
	});

	it('skips setup without saving coins', async () => {
		renderOnboarding();

		fireEvent.click(coins().getByRole('button', { name: /Ethereum/ }));
		fireEvent.click(screen.getByRole('button', { name: 'Skip setup' }));

		await waitFor(() => expect(screen.getByText('Dashboard home')).toBeTruthy());
		expect(mocks.setSelectedCurrencies).not.toHaveBeenCalled();
		expect(mocks.setOnboardingCompleted).toHaveBeenCalledWith(true);
	});

	it('only signs out through the explicit button', () => {
		renderOnboarding();
		fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

		expect(mocks.signOutUser).toHaveBeenCalledOnce();
		expect(screen.queryByRole('button', { name: /Back/ })).toBeNull();
	});
});
