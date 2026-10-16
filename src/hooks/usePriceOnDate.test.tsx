import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getQuoteByTimestamp = vi.hoisted(() => vi.fn());
vi.mock('../api', () => ({ getQuoteByTimestamp }));

import { dateToStorage } from '../utils/helpers';
import { usePriceOnDate } from './usePriceOnDate';

const quote = (price: number) => ({ data: { quotes: [{ quote: { price } }] } });
const today = dateToStorage(new Date());
const past = dateToStorage(new Date(2024, 2, 1));

const setup = () => {
	const client = new QueryClient();
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return (options: Partial<Parameters<typeof usePriceOnDate>[0]> = {}) =>
		renderHook(
			() =>
				usePriceOnDate({
					cmcId: 1,
					currencyQuote: 'EUR',
					currentPrice: 60000,
					date: past,
					enabled: true,
					...options,
				}),
			{ wrapper }
		);
};

describe('usePriceOnDate', () => {
	beforeEach(() => {
		getQuoteByTimestamp.mockReset();
	});

	it("uses the current price for today, without a request", () => {
		const { result } = setup()({ date: today });

		expect(result.current).toEqual({ price: 60000, status: 'found' });
		expect(getQuoteByTimestamp).not.toHaveBeenCalled();
	});

	it('says unavailable for today when the coin has no current price', () => {
		const { result } = setup()({ currentPrice: null, date: today });

		expect(result.current).toEqual({ status: 'unavailable' });
	});

	it('looks up an earlier day at 12:00 UTC, in the chosen currency', async () => {
		getQuoteByTimestamp.mockResolvedValue(quote(55000));
		const { result } = setup()();

		expect(result.current).toEqual({ status: 'loading' });
		await waitFor(() => {
			expect(result.current).toEqual({ price: 55000, status: 'found' });
		});
		expect(getQuoteByTimestamp).toHaveBeenCalledWith(1, 2790, Date.UTC(2024, 2, 1, 12) / 1000);
	});

	it('uses the USD id for dollars', async () => {
		getQuoteByTimestamp.mockResolvedValue(quote(60000));
		const { result } = setup()({ currencyQuote: 'USD' });

		await waitFor(() => {
			expect(result.current.status).toBe('found');
		});
		expect(getQuoteByTimestamp).toHaveBeenCalledWith(1, 2781, expect.any(Number));
	});

	it('says unavailable when the server has no price', async () => {
		getQuoteByTimestamp.mockResolvedValue({ data: null, error: 'No price' });
		const { result } = setup()();

		await waitFor(() => {
			expect(result.current).toEqual({ status: 'unavailable' });
		});
	});

	it('looks up nothing until enabled', () => {
		const { result } = setup()({ enabled: false });

		expect(result.current).toEqual({ status: 'idle' });
		expect(getQuoteByTimestamp).not.toHaveBeenCalled();
	});

	it('asks only once for the same coin and hour', async () => {
		getQuoteByTimestamp.mockResolvedValue(quote(55000));
		const render = setup();

		const first = render();
		await waitFor(() => {
			expect(first.result.current.status).toBe('found');
		});
		const second = render();

		expect(second.result.current).toEqual({ price: 55000, status: 'found' });
		expect(getQuoteByTimestamp).toHaveBeenCalledOnce();
	});
});
