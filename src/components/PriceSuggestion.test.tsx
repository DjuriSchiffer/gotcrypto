import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PriceOnDate } from '../hooks/usePriceOnDate';

const mocks = vi.hoisted(() => {
	const idle = (): PriceOnDate => ({ status: 'idle' });
	return { lookup: idle(), usePriceOnDate: vi.fn() };
});

vi.mock('../hooks/useAppState', () => ({ useAppState: () => ({ dateLocale: 'nl' }) }));
vi.mock('../hooks/usePriceOnDate', () => ({ usePriceOnDate: mocks.usePriceOnDate }));

import { currencyFormat, dateForDisplay, dateToStorage } from '../utils/helpers';
import PriceSuggestion from './PriceSuggestion';

const past = dateToStorage(new Date(2024, 2, 15));
const coin = { cmcId: 1, currentPrice: 60000, name: 'Bitcoin' };

const renderSuggestion = (props: Partial<Parameters<typeof PriceSuggestion>[0]> = {}) => {
	const onUse = vi.fn();
	render(
		<PriceSuggestion
			amount="2"
			coin={coin}
			currencyQuote="EUR"
			date={past}
			enteredTotal=""
			onUse={onUse}
			{...props}
		/>
	);
	return onUse;
};

describe('PriceSuggestion', () => {
	beforeEach(() => {
		mocks.usePriceOnDate.mockImplementation(() => mocks.lookup);
	});

	it('shows the price on that date and fills in amount × price when asked', () => {
		mocks.lookup = { price: 50000, status: 'found' };
		const onUse = renderSuggestion();

		expect(screen.getByRole('status').textContent).toContain(
			`On ${dateForDisplay(past, 'nl')}, 1 Bitcoin was ${currencyFormat(50000, 'EUR')}`
		);
		fireEvent.click(screen.getByRole('button', { name: `Use ${currencyFormat(100000, 'EUR')}` }));

		expect(onUse).toHaveBeenCalledWith(100000);
	});

	it('says "used" once the price field holds the suggestion', () => {
		mocks.lookup = { price: 50000, status: 'found' };
		renderSuggestion({ enteredTotal: '100000.00' });

		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByText('Used')).toBeTruthy();
	});

	it('speaks of now for today', () => {
		mocks.lookup = { price: 60000, status: 'found' };
		renderSuggestion({ date: dateToStorage(new Date()) });

		expect(screen.getByRole('status').textContent).toContain('Now, 1 Bitcoin is');
	});

	it('shows that it is looking the price up', () => {
		mocks.lookup = { status: 'loading' };
		renderSuggestion();

		expect(screen.getByRole('status').textContent).toContain('Looking up the price on');
	});

	it('asks to enter the price when none is found', () => {
		mocks.lookup = { status: 'unavailable' };
		renderSuggestion();

		expect(screen.getByRole('status').textContent).toContain('Enter it yourself');
	});

	it('looks nothing up and shows nothing without a quantity', () => {
		mocks.lookup = { status: 'idle' };
		const { container } = render(
			<PriceSuggestion
				amount=""
				coin={coin}
				currencyQuote="EUR"
				date={past}
				enteredTotal=""
				onUse={vi.fn()}
			/>
		);

		expect(container.innerHTML).toBe('');
		expect(mocks.usePriceOnDate).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
	});
});
