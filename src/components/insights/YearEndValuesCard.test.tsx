import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SelectedAsset } from '../../types/currency';

import { asset, buy } from '../../test/factories';
import { yearEndTimestamp } from '../../utils/yearEnd';

const mocks = vi.hoisted(() => ({ getQuoteByTimestamp: vi.fn() }));
vi.mock('../../api', () => ({ getQuoteByTimestamp: mocks.getQuoteByTimestamp }));

import YearEndValuesCard from './YearEndValuesCard';

const priceResponse = (price: number) => ({ data: { convertQuotes: [{ price }] } });
const errorResponse = { data: null, error: 'Failed to fetch cryptocurrency data' };

/** Bitcoin since 2023, Ethereum since 2024; "now" is in 2026, so 2023–2025 are complete years */
const assets: Array<SelectedAsset> = [
	asset(1, [buy(1, 20000, '2023-03-01')], 'Bitcoin'),
	asset(1027, [buy(10, 20000, '2024-03-01')], 'Ethereum'),
];

const renderCard = () =>
	render(
		<QueryClientProvider
			client={new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })}
		>
			<YearEndValuesCard currencyQuote="EUR" selectedAssets={assets} />
		</QueryClientProvider>
	);

const rowFor = (year: number) =>
	screen.getAllByRole('row').find((row) => row.textContent.startsWith(String(year)));

describe('YearEndValuesCard', () => {
	beforeEach(() => {
		vi.useFakeTimers({ now: new Date('2026-10-13T12:00:00Z'), toFake: ['Date'] });
		mocks.getQuoteByTimestamp.mockReset();
	});

	it('values every completed year with its own year-end prices', async () => {
		const prices: Record<string, number> = {
			[`1-${yearEndTimestamp(2023)}`]: 40000,
			[`1-${yearEndTimestamp(2024)}`]: 90000,
			[`1-${yearEndTimestamp(2025)}`]: 80000,
			[`1027-${yearEndTimestamp(2024)}`]: 3000,
			[`1027-${yearEndTimestamp(2025)}`]: 2500,
		};
		mocks.getQuoteByTimestamp.mockImplementation(
			(coinId: number, _convertId: number, timestamp: number) =>
				Promise.resolve(priceResponse(prices[`${coinId}-${timestamp}`]))
		);
		renderCard();

		await waitFor(() => expect(rowFor(2025)).toBeTruthy());

		const text = (year: number) => rowFor(year)?.textContent.replace(/\s/g, ' ');
		expect(text(2023)).toContain('€ 40.000,00');
		expect(text(2024)).toContain('€ 120.000,00'); // 90.000 + 10 × 3.000
		expect(text(2024)).toContain('+200.00%');
		expect(text(2025)).toContain('€ 105.000,00'); // 80.000 + 10 × 2.500
		expect(screen.queryByText(/couldn't be loaded/)).toBeNull();
	});

	it('marks a year as unavailable instead of using another price', async () => {
		mocks.getQuoteByTimestamp.mockImplementation(
			(coinId: number, _convertId: number, timestamp: number) =>
				Promise.resolve(
					coinId === 1027 && timestamp === yearEndTimestamp(2024)
						? errorResponse
						: priceResponse(50000)
				)
		);
		renderCard();

		await waitFor(() => expect(rowFor(2024)).toBeTruthy());

		const row = rowFor(2024);
		if (!row) throw new Error('Expected a row for 2024');

		const row2024 = within(row);
		expect(row2024.getByText('Price unavailable')).toBeTruthy();
		expect(row2024.getByLabelText('No year-end price for Ethereum')).toBeTruthy();
		expect(screen.getByRole('alert').textContent).toMatch(/don't use them for your tax return/);

		// The year after can't be compared with an incomplete total
		expect(rowFor(2025)?.textContent).not.toMatch(/%/);
	});

	it('does not show a single number when the API is completely down', async () => {
		mocks.getQuoteByTimestamp.mockRejectedValue(new Error('Request failed with status code 500'));
		renderCard();

		await waitFor(() => expect(rowFor(2023)).toBeTruthy());

		expect(screen.getAllByText('Price unavailable')).toHaveLength(3);
		expect(screen.queryByText(/€/)).toBeNull();
	});
});
