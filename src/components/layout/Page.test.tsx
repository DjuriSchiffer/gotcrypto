import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	auth: {
		isAnonymous: false,
		user: { displayName: 'Henk', email: 'henk@example.com', photoURL: null },
	},
	signOutUser: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('../../services/authService', () => ({ signOutUser: mocks.signOutUser }));

import Page from './Page';

const renderAt = (path: string) =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route element={<Page>page content</Page>} path="*" />
			</Routes>
		</MemoryRouter>
	);

// The desktop sidebar is always in the DOM (CSS hides it on small screens); it's the first navigation
const desktopNav = () => within(screen.getAllByRole('navigation', { name: 'Main' })[0]);

describe('Page layout', () => {
	beforeEach(() => {
		mocks.auth.isAnonymous = false;
		mocks.signOutUser.mockReset();
	});

	it('renders the page content', () => {
		renderAt('/');

		expect(screen.getByText('page content')).toBeTruthy();
	});

	it('marks the current page in the navigation', () => {
		renderAt('/insights');

		expect(desktopNav().getByRole('link', { name: 'Insights' }).getAttribute('aria-current')).toBe(
			'page'
		);
		expect(
			desktopNav().getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')
		).toBeNull();
	});

	it('keeps the dashboard highlighted on an asset page', () => {
		renderAt('/bitcoin');

		expect(desktopNav().getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe(
			'page'
		);
	});

	it('opens the mobile menu and closes it after navigating', () => {
		renderAt('/');

		const menuButton = screen.getByRole('button', { name: 'Open menu' });
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
		fireEvent.click(menuButton);
		expect(menuButton.getAttribute('aria-expanded')).toBe('true');

		const drawer = within(screen.getByRole('dialog'));
		fireEvent.click(drawer.getByRole('link', { name: 'Settings' }));

		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('shows the signed-in account and signs out', () => {
		renderAt('/');

		expect(screen.getAllByText('henk@example.com').length).toBeGreaterThan(0);
		fireEvent.click(screen.getAllByRole('button', { name: /Sign out/ })[0]);

		expect(mocks.signOutUser).toHaveBeenCalledOnce();
	});

	it('points anonymous users to saving their data', () => {
		mocks.auth.isAnonymous = true;
		renderAt('/');

		expect(screen.getAllByText('Anonymous session').length).toBeGreaterThan(0);
		expect(screen.getAllByRole('link', { name: /Save to Google/ })[0].getAttribute('href')).toBe(
			'/user-settings'
		);
	});
});
