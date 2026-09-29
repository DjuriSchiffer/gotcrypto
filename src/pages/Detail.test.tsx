import type { ReactNode } from 'react';

import type { SelectedAsset } from '../types/currency';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { asset, buy, sell } from '../test/factories';
import ReducerProvider from '../providers/ReducerProvider';

const storage = vi.hoisted(() => ({
	selectedCurrencies: [] as Array<SelectedAsset>,
	updateCurrency: vi.fn(),
}));

vi.mock('../components/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../components/ApexChart', () => ({ default: () => <div data-testid="chart" /> }));
vi.mock('../hooks/useStorage', () => ({ useStorage: () => storage }));
vi.mock('../hooks/useCoinMarketCap', () => ({
	default: () => ({
		data: [
			{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
			{ cmc_id: 2, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
		],
		isError: false,
		isLoading: false,
	}),
}));
// The real form needs auth and a date picker; this stand-in submits a fixed buy
vi.mock('../components/TransactionForm', () => ({
	default: ({
		onSubmit,
		submitLabel,
	}: {
		onSubmit: (data: unknown) => void;
		submitLabel: string;
	}) => (
		<button
			onClick={() =>
				onSubmit({
					amount: '1',
					date: '2024-09-01T00:00:00.000Z',
					purchasePrice: '50000',
					transactionType: 'buy',
				})
			}
			type="button"
		>
			{submitLabel}
		</button>
	),
}));

import Detail from './Detail';

const renderDetail = (path = '/bitcoin') =>
	render(
		<ReducerProvider>
			<MemoryRouter initialEntries={[path]}>
				<Routes>
					<Route element={<Detail />} path="/:slug" />
				</Routes>
			</MemoryRouter>
		</ReducerProvider>
	);

const lastSaved = () => storage.updateCurrency.mock.calls.at(-1)?.[0] as SelectedAsset;

describe('Detail page', () => {
	beforeEach(() => {
		storage.updateCurrency.mockReset();
		storage.selectedCurrencies = [
			asset(1, [buy(1, 10000, '2023-05-01'), sell(0.5, 30000, '2024-06-01')], 'Bitcoin'),
			asset(2, [], 'Ethereum'),
		];
	});

	it('shows a message for an unknown asset', () => {
		renderDetail('/not-a-coin');

		expect(screen.getByText("We couldn't find this asset.")).toBeTruthy();
		expect(screen.getByRole('link', { name: /Back to dashboard/ })).toBeTruthy();
	});

	it('finds an asset that was saved without a slug', () => {
		storage.selectedCurrencies = [{ ...asset(1, [buy(1, 10000)], 'Bitcoin'), slug: '' }];
		renderDetail();

		expect(screen.getByText('1 transaction')).toBeTruthy();
	});

	it('shows the position and the transactions grouped by year', () => {
		renderDetail();

		expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeTruthy();
		expect(screen.getByText('Holdings')).toBeTruthy();

		const rows = screen.getAllByRole('row').map((row) => row.textContent?.replace(/\s/g, ' '));
		// year header, sell, year header, buy — newest first
		expect(rows[0]).toBe('2024');
		expect(rows[1]).toContain('Sell');
		expect(rows[1]).toContain('€ 25.000,00'); // realized on this sell
		expect(rows[2]).toBe('2023');
		expect(rows[3]).toContain('+500.00%'); // bought at 10.000, now 60.000
	});

	it('adds a transaction', () => {
		renderDetail();

		fireEvent.click(screen.getAllByRole('button', { name: /Add transaction/ })[0]);
		fireEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', { name: 'Add Transaction' })
		);

		expect(lastSaved().transactions).toHaveLength(3);
		expect(lastSaved().totals.totalAmount).toBe(1.5);
	});

	it('edits a transaction in place', () => {
		renderDetail();

		fireEvent.click(screen.getByRole('button', { name: /Edit transaction of 01-05-2023/ }));
		fireEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', { name: 'Update Transaction' })
		);

		const saved = lastSaved();
		expect(saved.transactions).toHaveLength(2);
		expect(saved.transactions.find((item) => item.type === 'buy')?.purchasePrice).toBe('50000.00');
	});

	it('removes a transaction after confirming', () => {
		renderDetail();

		fireEvent.click(screen.getByRole('button', { name: /Remove transaction of 01-06-2024/ }));
		fireEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove transaction' })
		);

		expect(lastSaved().transactions.map((item) => item.type)).toEqual(['buy']);
	});

	it('only removes all transactions after typing DELETE', () => {
		renderDetail();

		fireEvent.click(screen.getByRole('button', { name: /More actions/ }));
		// flowbite puts role="menuitem" on the <li>; the click handler is on the button inside it
		const menuItem = screen.getByRole('menuitem', { name: /Remove all transactions/ });
		fireEvent.click(within(menuItem).getByRole('button'));

		const dialog = within(screen.getByRole('dialog'));
		const confirm = dialog.getByRole('button', { name: 'Remove all transactions' });
		expect(confirm.hasAttribute('disabled')).toBe(true);

		fireEvent.change(dialog.getByLabelText(/to confirm/), { target: { value: 'DELETE' } });
		fireEvent.click(confirm);

		expect(lastSaved().transactions).toEqual([]);
	});

	it('shows charts only when their tab is opened', () => {
		renderDetail();

		expect(screen.queryAllByTestId('chart')).toHaveLength(0);
		fireEvent.click(screen.getByRole('tab', { name: /Charts/ }));

		expect(screen.getAllByTestId('chart')).toHaveLength(3);
	});

	it('invites a first transaction and disables charts without transactions', () => {
		renderDetail('/ethereum');

		expect(screen.getByText(/Add your first Ethereum transaction/)).toBeTruthy();
		expect(screen.queryByText('Holdings')).toBeNull();
		expect(screen.getByRole('tab', { name: /Charts/ }).hasAttribute('disabled')).toBe(true);
	});
});
