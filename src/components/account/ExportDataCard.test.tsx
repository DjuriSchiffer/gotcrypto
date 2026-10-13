import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { asset, buy } from '../../test/factories';

const mocks = vi.hoisted(() => ({ downloadFile: vi.fn() }));
vi.mock('../../utils/download', () => ({ downloadFile: mocks.downloadFile }));

import ExportDataCard from './ExportDataCard';

const assets = [asset(1, [buy(1, 100), buy(2, 300)], 'Bitcoin'), asset(2, [], 'Ethereum')];
const exportButton = () => screen.getByRole('button', { name: /Export CSV/ });

describe('ExportDataCard', () => {
	beforeEach(() => {
		mocks.downloadFile.mockReset();
	});

	it('summarizes what will be exported', () => {
		render(<ExportDataCard assets={assets} currencyQuote="EUR" isAnonymous={false} />);

		expect(screen.getByText('2 transactions in 1 asset, with prices in EUR.')).toBeTruthy();
	});

	it('downloads a CSV with every transaction', () => {
		render(<ExportDataCard assets={assets} currencyQuote="USD" isAnonymous={false} />);

		fireEvent.click(exportButton());

		expect(mocks.downloadFile).toHaveBeenCalledOnce();
		const [fileName, content] = mocks.downloadFile.mock.calls[0] as [string, string];
		expect(fileName).toMatch(/^gotcrypto-transactions-\d{4}-\d{2}-\d{2}\.csv$/);
		expect(content.trim().split('\r\n')).toHaveLength(3); // header + 2 transactions
		expect(content).toContain(',USD,');
	});

	it('only includes the tax column when asked to', () => {
		const { rerender } = render(
			<ExportDataCard assets={assets} currencyQuote="EUR" isAnonymous={false} />
		);
		fireEvent.click(exportButton());
		expect(mocks.downloadFile.mock.calls[0][1]).not.toContain('exclude_for_tax');

		rerender(
			<ExportDataCard assets={assets} currencyQuote="EUR" includeTaxColumn isAnonymous={false} />
		);
		fireEvent.click(exportButton());
		expect(mocks.downloadFile.mock.calls[1][1]).toContain('exclude_for_tax');
	});

	it('is disabled when there is nothing to export', () => {
		render(<ExportDataCard assets={[asset(1)]} currencyQuote="EUR" isAnonymous={false} />);

		expect(exportButton().hasAttribute('disabled')).toBe(true);
		expect(screen.getByText('No transactions to export yet.')).toBeTruthy();
	});

	it('reminds anonymous users to keep a backup', () => {
		render(<ExportDataCard assets={assets} currencyQuote="EUR" isAnonymous />);

		expect(screen.getByText(/only lives in this browser/)).toBeTruthy();
	});
});
