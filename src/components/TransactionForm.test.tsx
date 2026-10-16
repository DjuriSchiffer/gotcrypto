import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ isAdmin: false }) }));
// The real date picker needs a browser calendar; the form only needs its value
vi.mock('./DatePicker', () => ({
	default: ({ date }: { date: string }) => <input aria-label="Date" readOnly value={date} />,
}));

import TransactionForm from './TransactionForm';

const renderForm = (props: Partial<Parameters<typeof TransactionForm>[0]> = {}) => {
	const onSubmit = vi.fn();
	render(<TransactionForm currencyQuote="EUR" onSubmit={onSubmit} submitLabel="Save" {...props} />);
	return onSubmit;
};

describe('TransactionForm', () => {
	it('stays on Transfer after clicking it', async () => {
		renderForm();

		fireEvent.click(screen.getByRole('button', { name: 'Transfer' }));

		await waitFor(() => {
			expect(screen.getByText('Transfer Direction')).toBeTruthy();
		});
		expect(screen.getByText('Transfer value')).toBeTruthy();
	});

	it('switches between buy and sell', () => {
		renderForm();

		fireEvent.click(screen.getByRole('button', { name: 'Sell' }));
		expect(screen.getByText('Sell Price')).toBeTruthy();

		fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
		expect(screen.getByText('Purchase Price')).toBeTruthy();
	});

	it('opens an outgoing transfer as it was saved, with positive numbers', () => {
		renderForm({
			defaultValues: {
				amount: '-0.5',
				date: '2024-03-01T00:00:00.000Z',
				purchasePrice: '-15000',
				transactionType: 'transfer',
				transferType: 'out',
			},
			isEdit: true,
		});

		expect(screen.getByText('Transfer Direction')).toBeTruthy();
		expect(screen.getByLabelText('Transfer Out')).toHaveProperty('checked', true);
		expect(screen.getByPlaceholderText('10.50')).toHaveProperty('value', '0.5');
	});

	it('keeps what you typed while editing', () => {
		renderForm({
			defaultValues: {
				amount: '1',
				date: '2024-03-01T00:00:00.000Z',
				purchasePrice: '50000',
				transactionType: 'buy',
			},
			isEdit: true,
		});
		const quantity = screen.getByPlaceholderText('10.50');

		fireEvent.change(quantity, { target: { value: '2' } });
		fireEvent.click(screen.getByRole('button', { name: 'Sell' }));

		expect(quantity).toHaveProperty('value', '2');
		expect(screen.getByText('Sell Price')).toBeTruthy();
	});
});
