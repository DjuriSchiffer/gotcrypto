import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SelectedAsset } from '../../types/currency';

import { asset, buy } from '../../test/factories';
import ImportDataCard from './ImportDataCard';

const coins = [
	{ cmc_id: 1, cmc_rank: 1, name: 'Bitcoin', price: 60000, slug: 'bitcoin' },
	{ cmc_id: 1027, cmc_rank: 2, name: 'Ethereum', price: 3000, slug: 'ethereum' },
];

const HEADER = 'date,asset,cmc_id,type,amount,total,currency';
const file = (content: string, name = 'export.csv') =>
	new File([content], name, { type: 'text/csv' });

const onImport = vi.fn<(assets: Array<SelectedAsset>) => Promise<void>>();

const renderCard = (assets: Array<SelectedAsset> = []) =>
	render(
		<ImportDataCard
			assets={assets}
			currencyQuote="EUR"
			fetchedCurrencies={coins}
			onImport={onImport}
		/>
	);

const choose = (content: string) =>
	fireEvent.change(screen.getByLabelText('CSV file to import'), {
		target: { files: [file(content)] },
	});

describe('ImportDataCard', () => {
	beforeEach(() => {
		onImport.mockReset();
		onImport.mockResolvedValue(undefined);
	});

	it('previews the import and saves only after confirming', async () => {
		const bitcoin = asset(1, [buy(1, 100, '2023-01-01')], 'Bitcoin');
		renderCard([bitcoin]);

		choose(
			`${HEADER}\n2023-01-01,Bitcoin,1,buy,1,100,EUR\n2024-01-01,Ethereum,1027,buy,10,3000,EUR\n2024-01-01,Dogecoin,74,buy,1,1,EUR`
		);

		const dialog = within(await screen.findByRole('dialog'));
		expect(dialog.getByText('1 new transaction')).toBeTruthy();
		expect(dialog.getByText(/1 transaction you already have/)).toBeTruthy();
		expect(dialog.getByText("1 row that can't be imported")).toBeTruthy();
		expect(dialog.getByText(/Line 4:/)).toBeTruthy();
		expect(dialog.getByText('Ethereum')).toBeTruthy(); // new coin on the dashboard
		expect(onImport).not.toHaveBeenCalled();

		fireEvent.click(dialog.getByRole('button', { name: 'Import 1 transaction' }));

		await waitFor(() => expect(onImport).toHaveBeenCalledOnce());
		const saved = onImport.mock.calls[0][0];
		expect(saved.map((item) => item.name)).toEqual(['Bitcoin', 'Ethereum']);
		expect(saved[0]).toBe(bitcoin); // untouched
		expect(await screen.findByText('Imported 1 transaction.')).toBeTruthy();
	});

	it('saves nothing when cancelled', async () => {
		renderCard();
		choose(`${HEADER}\n2024-01-01,Bitcoin,1,buy,1,100,EUR`);

		fireEvent.click(
			within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' })
		);

		expect(onImport).not.toHaveBeenCalled();
	});

	it('cannot import when nothing is new', async () => {
		renderCard([asset(1, [buy(1, 100, '2024-01-01')], 'Bitcoin')]);
		choose(`${HEADER}\n2024-01-01,Bitcoin,1,buy,1,100,EUR`);

		const button = within(await screen.findByRole('dialog')).getByRole('button', {
			name: 'Nothing to import',
		});
		expect(button.hasAttribute('disabled')).toBe(true);
	});

	it('explains a file that is not a transaction export', async () => {
		renderCard();
		choose('name,value\nx,1');

		expect((await screen.findByRole('alert')).textContent).toMatch(/missing the columns/);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('keeps the portfolio unchanged when saving fails', async () => {
		onImport.mockRejectedValue(new Error('offline'));
		renderCard();
		choose(`${HEADER}\n2024-01-01,Bitcoin,1,buy,1,100,EUR`);

		const dialog = within(await screen.findByRole('dialog'));
		fireEvent.click(dialog.getByRole('button', { name: /Import 1/ }));

		// The error shows in the dialog, which stays open for another try
		expect((await dialog.findByRole('alert')).textContent).toMatch(/Your portfolio is unchanged/);
		expect(dialog.getByRole('button', { name: /Import 1/ }).hasAttribute('disabled')).toBe(false);
	});

	it('waits for the coin list before allowing an import', () => {
		render(
			<ImportDataCard
				assets={[]}
				currencyQuote="EUR"
				fetchedCurrencies={undefined}
				onImport={onImport}
			/>
		);

		expect(screen.getByRole('button', { name: /Choose CSV file/ }).hasAttribute('disabled')).toBe(
			true
		);
	});
});
