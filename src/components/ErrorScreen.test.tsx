import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/contact', () => ({
	contactMailto: (subject: string, body?: string) =>
		`mailto:me@example.com?subject=${subject}${body ? `&body=${body}` : ''}`,
}));

import ErrorScreen from './ErrorScreen';

describe('ErrorScreen', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('apologises and says the data is safe', () => {
		render(<ErrorScreen />);

		expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeTruthy();
		expect(screen.getByText(/Your portfolio is saved and wasn't affected/)).toBeTruthy();
	});

	it('reloads the page', () => {
		const reload = vi.fn();
		vi.stubGlobal('location', { href: 'http://localhost/', reload });
		render(<ErrorScreen />);

		fireEvent.click(screen.getByRole('button', { name: /Reload page/ }));

		expect(reload).toHaveBeenCalledOnce();
	});

	it('links back to the dashboard', () => {
		render(<ErrorScreen />);

		expect(screen.getByRole('link', { name: 'Go to dashboard' }).getAttribute('href')).toBe('/');
	});

	it('shows the error reference and puts it in the report email', () => {
		render(<ErrorScreen eventId="abc123" />);

		expect(screen.getByText('abc123')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Let me know' }).getAttribute('href')).toContain(
			'Error reference: abc123'
		);
	});
});
