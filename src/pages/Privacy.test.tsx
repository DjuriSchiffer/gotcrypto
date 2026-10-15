import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/privacy', () => ({
	PRIVACY: {
		contactEmail: 'privacy@example.com',
		contactName: 'Test Owner',
		firestoreLocation: 'eur3 (Europe)',
		lastUpdated: '1 January 2030',
	},
}));

import Privacy from './Privacy';

const renderPrivacy = () =>
	render(
		<MemoryRouter>
			<Privacy />
		</MemoryRouter>
	);

describe('Privacy page', () => {
	it('names who is responsible and how to reach them', () => {
		renderPrivacy();

		expect(screen.getAllByText(/Test Owner/).length).toBeGreaterThan(0);
		expect(
			screen.getAllByRole('link', { name: 'privacy@example.com' })[0].getAttribute('href')
		).toBe('mailto:privacy@example.com');
	});

	it('says where the data is stored and when the page was updated', () => {
		renderPrivacy();

		expect(screen.getByText(/location eur3 \(Europe\)/)).toBeTruthy();
		expect(screen.getByText('Last updated 1 January 2030')).toBeTruthy();
	});

	it('leads back to the app', () => {
		renderPrivacy();

		expect(screen.getByRole('link', { name: /Back to the app/ }).getAttribute('href')).toBe('/');
	});
});
