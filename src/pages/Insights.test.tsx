// @vitest-environment jsdom
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ReducerProvider from '../providers/ReducerProvider';

import { asset, buy, sell } from '../test/factories';

vi.mock('../components/ApexChart', () => ({ default: () => <div data-testid="chart" /> }));
vi.mock('../components/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../hooks/useStorage', () => ({
	useStorage: () => ({
		selectedCurrencies: [
			asset(1, [buy(1, 10000), sell(0.5, 30000)], 'Bitcoin'),
			asset(2, [buy(10, 20000)], 'Ethereum'),
			asset(3, [buy(100, 500), sell(100, 200)], 'Dogecoin'),
		],
	}),
}));
vi.mock('../hooks/useCoinMarketCap', () => ({
	default: () => ({
		data: [
			{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
			{ cmc_id: 2, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
			{ cmc_id: 3, cmc_rank: 3, name: 'Dogecoin', price: 0.1, slug: 'dogecoin' },
		],
		isError: false,
		isLoading: false,
	}),
}));
vi.mock('../hooks/useHistoricalPortfolioValues', () => ({
	useHistoricalPortfolioValues: () => ({
		isError: false,
		isLoading: false,
		yearlyTotals: [
			{ totalValue: 20000, year: 2023 },
			{ totalValue: 30000, year: 2024 },
		],
	}),
}));

import Insights from './Insights';
import type { ReactNode } from 'react';

describe('Insights page', () => {
	it('renders every section with real numbers', () => {
		render(
			<ReducerProvider>
				<MemoryRouter>
					<Insights />
				</MemoryRouter>
			</ReducerProvider>
		);

		expect(screen.getByText('Insights')).toBeTruthy();
		// value: 0.5 × 60.000 + 10 × 3.000 = 60.000
		expect(screen.getAllByText(/60\.000,00/).length).toBeGreaterThan(0);
		expect(screen.getByText('Best performer')).toBeTruthy();
		expect(screen.getByText('Closed')).toBeTruthy();
		expect(screen.getAllByText('+50.00%').length).toBe(2); // 2024 vs 2023, and Ethereum's return
		expect(screen.getByTestId('chart')).toBeTruthy();

		const table = screen.getAllByRole('table')[0];
		const firstRowName = () => within(table).getAllByRole('row')[0].textContent ?? '';
		// flowbite 0.11's TableHead has no <tr>, so row 0 is the first asset
		// sort by total P/L ascending: Dogecoin (loss) comes first
		fireEvent.click(within(table).getByRole('button', { name: /Total P\/L/ }));
		fireEvent.click(within(table).getByRole('button', { name: /Total P\/L/ }));
		expect(firstRowName()).toContain('Dogecoin');
	});
});
