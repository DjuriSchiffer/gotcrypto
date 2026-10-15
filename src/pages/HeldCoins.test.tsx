import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SelectedAsset } from '../types/currency';

import { asset, buy, sell } from '../test/factories';

/**
 * A coin you hold must stay visible on the dashboard and its detail page must keep working,
 * even when the price list doesn't include it.
 */

const storage = vi.hoisted(() => ({
	selectedCurrencies: [] as Array<SelectedAsset>,
	setSelectedCurrencies: vi.fn(),
	updateCurrency: vi.fn(),
}));

vi.mock('../components/layout/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../components/ApexChart', () => ({ default: () => <div data-testid="chart" /> }));
vi.mock('../hooks/useStorage', () => ({ useStorage: () => storage }));
vi.mock('../hooks/useCoinMarketCap', () => ({
	// Only Bitcoin has a price; "Gone Coin" (id 999) is missing from the list
	default: () => ({
		data: [{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' }],
		isError: false,
		isLoading: false,
	}),
}));
vi.mock('../hooks/useAppState', () => ({
	useAppState: () => ({
		currencyQuote: 'EUR',
		dashboardLayout: 'Grid',
		dateLocale: 'nl-NL',
		sortMethod: 'has_selected',
	}),
}));
vi.mock('../components/TransactionForm', () => ({ default: () => null }));

import Dashboard from './Dashboard';
import Detail from './Detail';

const renderAt = (path: string) =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route element={<Dashboard />} path="/" />
				<Route element={<Detail />} path="/:slug" />
			</Routes>
		</MemoryRouter>
	);

describe('a held coin without a price', () => {
	beforeEach(() => {
		storage.selectedCurrencies = [
			asset(1, [buy(1, 10000)], 'Bitcoin'),
			asset(999, [buy(10, 500), sell(5, 400)], 'Gone Coin'),
		];
	});

	describe('on the dashboard', () => {
		it('is still shown, marked as having no price', () => {
			renderAt('/');

			expect(screen.getByRole('link', { name: 'Gone Coin' })).toHaveProperty(
				'pathname',
				'/gone-coin'
			);
			expect(screen.getByText('Price unavailable')).toBeTruthy();
			expect(screen.getByText('No current price')).toBeTruthy();
		});

		it('is left out of the totals, with a note saying so', () => {
			renderAt('/');

			expect(screen.getByRole('status').textContent).toContain(
				"Gone Coin has no current price, so it isn't included"
			);
			// Bitcoin alone: 1 × 60.000. Counting Gone Coin as zero would have shown a loss.
			expect(screen.getAllByText(/60\.000,00/).length).toBeGreaterThan(0);
		});

		it('shows no note when every held coin has a price', () => {
			storage.selectedCurrencies = [asset(1, [buy(1, 10000)], 'Bitcoin')];
			renderAt('/');

			expect(screen.queryByRole('status')).toBeNull();
		});
	});

	describe('on its detail page', () => {
		it('opens and shows the transactions', () => {
			renderAt('/gone-coin');

			expect(screen.getByRole('heading', { name: 'Gone Coin' })).toBeTruthy();
			expect(screen.getByText('Price unavailable')).toBeTruthy();
			expect(screen.getByText(/Your transactions are safe/)).toBeTruthy();
			expect(screen.getByText('2 transactions')).toBeTruthy();
			expect(screen.queryByText("We couldn't find this asset.")).toBeNull();
		});

		it('opens by id for an asset saved without a slug', () => {
			storage.selectedCurrencies = [{ ...asset(999, [buy(1, 50)], 'Gone Coin'), slug: '' }];
			renderAt('/999');

			expect(screen.getByRole('heading', { name: 'Gone Coin' })).toBeTruthy();
		});

		it('disables the charts, which need a current price', () => {
			renderAt('/gone-coin');

			expect(screen.getByRole('tab', { name: /Charts/ }).hasAttribute('disabled')).toBe(true);
		});

		it('still says not found for a coin you never added', () => {
			renderAt('/some-other-coin');

			expect(screen.getByText("We couldn't find this asset.")).toBeTruthy();
		});
	});
});
