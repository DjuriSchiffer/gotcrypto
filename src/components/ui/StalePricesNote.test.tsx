import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import StalePricesNote from './StalePricesNote';

describe('StalePricesNote', () => {
	it('shows nothing when prices are fresh', () => {
		const { container } = render(<StalePricesNote stale={false} updatedAt={new Date()} />);

		expect(container.innerHTML).toBe('');
	});

	it('says when the shown prices are from', () => {
		const updatedAt = new Date('2026-10-15T12:00:00.000Z');
		render(<StalePricesNote stale updatedAt={updatedAt} />);

		expect(screen.getByRole('status').textContent).toContain(
			`Showing prices from ${updatedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
		);
	});

	it('still warns without a time', () => {
		render(<StalePricesNote stale updatedAt={null} />);

		expect(screen.getByRole('status').textContent).toContain('Showing the last known prices');
	});
});
