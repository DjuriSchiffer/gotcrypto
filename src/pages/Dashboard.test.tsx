import type { ReactNode } from 'react';

import type { SelectedAsset } from '../types/currency';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { asset, buy, sell } from '../test/factories';
import ReducerProvider from '../providers/ReducerProvider';

// Shared, per-test storage state that the mocked useStorage reads from
const storage = vi.hoisted(() => ({
	selectedCurrencies: [] as Array<SelectedAsset>,
	setSelectedCurrencies: vi.fn(),
	updateCurrency: vi.fn(),
}));

vi.mock('../components/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../hooks/useStorage', () => ({
	useStorage: () => ({
		...storage,
		dashboardLayout: 'Grid',
		setDashboardLayout: vi.fn(),
	}),
}));
vi.mock('../hooks/useCoinMarketCap', () => ({
	default: () => ({
		data: [
			{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
			{ cmc_id: 2, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
			{ cmc_id: 3, cmc_rank: 3, name: 'Dogecoin', price: 0.1, slug: 'dogecoin' },
			{ cmc_id: 4, cmc_rank: 4, name: 'Solana', price: 150, slug: 'solana' },
		],
		isError: false,
		isLoading: false,
	}),
}));
// The real form needs auth and a date picker; this stand-in submits a fixed buy
vi.mock('../components/TransactionForm', () => ({
	default: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => (
		<button
			onClick={() =>
				onSubmit({
					amount: '2',
					date: '2024-03-15T00:00:00.000Z',
					purchasePrice: '5000',
					transactionType: 'buy',
				})
			}
			type="button"
		>
			Submit test transaction
		</button>
	),
}));

import Dashboard from './Dashboard';

const renderDashboard = () =>
	render(
		<ReducerProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</ReducerProvider>
	);

describe('Dashboard page', () => {
	beforeEach(() => {
		storage.setSelectedCurrencies.mockReset();
		storage.updateCurrency.mockReset();
		storage.selectedCurrencies = [
			asset(1, [buy(1, 10000), sell(0.5, 30000)], 'Bitcoin'),
			asset(2, [], 'Ethereum'),
			asset(3, [buy(100, 500), sell(100, 200)], 'Dogecoin'),
		];
	});

	it('shows an empty state when no assets are added', () => {
		storage.selectedCurrencies = [];
		renderDashboard();

		expect(screen.getByText(/haven't added any assets yet/)).toBeTruthy();
		expect(screen.queryByText('Total value')).toBeNull();
	});

	it('shows the key figures and a card per added asset', () => {
		renderDashboard();

		expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
		expect(screen.getByText('Total value')).toBeTruthy();

		const cards = within(screen.getByRole('region', { name: 'Assets' }));
		expect(cards.getByText('Bitcoin')).toBeTruthy();
		expect(cards.getByText('Position closed')).toBeTruthy(); // Dogecoin
		expect(cards.getByRole('button', { name: /Add first transaction/ })).toBeTruthy(); // Ethereum
		expect(cards.queryByText('Solana')).toBeNull(); // not added
	});

	it('adds a first transaction from the dashboard', () => {
		renderDashboard();

		fireEvent.click(screen.getByRole('button', { name: /Add first transaction/ }));
		expect(screen.getByText('Add your first Ethereum transaction')).toBeTruthy();

		fireEvent.click(screen.getByRole('button', { name: 'Submit test transaction' }));

		expect(storage.updateCurrency).toHaveBeenCalledOnce();
		const saved = storage.updateCurrency.mock.calls[0][0] as SelectedAsset;
		expect(saved).toMatchObject({ cmc_id: 2, slug: 'ethereum' });
		expect(saved.totals).toMatchObject({ totalAmount: 2, totalCostBasis: 5000 });
	});

	it('adds and removes assets in a single save', () => {
		renderDashboard();

		fireEvent.click(screen.getAllByRole('button', { name: /Manage assets/ })[0]);
		const modal = within(screen.getByRole('dialog'));

		fireEvent.click(modal.getByRole('button', { name: /Solana/ })); // add
		fireEvent.click(modal.getByRole('button', { name: /Ethereum/ })); // remove (no transactions)
		fireEvent.click(modal.getByRole('button', { name: /Save changes/ }));

		expect(storage.setSelectedCurrencies).toHaveBeenCalledOnce();
		const saved = storage.setSelectedCurrencies.mock.calls[0][0] as Array<SelectedAsset>;
		expect(saved.map((item) => item.cmc_id)).toEqual([1, 3, 4]);
		expect(saved.at(-1)).toMatchObject({ name: 'Solana', slug: 'solana' });
	});

	it('does not let you deselect an asset with transactions', () => {
		renderDashboard();

		fireEvent.click(screen.getAllByRole('button', { name: /Manage assets/ })[0]);
		const modal = within(screen.getByRole('dialog'));

		fireEvent.click(modal.getByRole('button', { name: /Bitcoin/ }));

		expect(modal.getByRole('button', { name: /Save changes/ }).hasAttribute('disabled')).toBe(true);
	});
});
