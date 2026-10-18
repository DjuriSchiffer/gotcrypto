import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthContextType } from '../../contexts/AuthContext';

import { AuthContext } from '../../contexts/AuthContext';
import SupportPrompt from './SupportPrompt';

const auth = (isAdmin = false): AuthContextType => ({
	isAdmin,
	isAnonymous: false,
	loading: false,
	refreshAuth: () => undefined,
	user: null,
});

const renderPrompt = (transactionCount: number, isAdmin = false) =>
	render(
		<AuthContext.Provider value={auth(isAdmin)}>
			<SupportPrompt transactionCount={transactionCount} />
		</AuthContext.Provider>
	);

describe('SupportPrompt', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it('links to Ko-fi after five transactions', () => {
		renderPrompt(5);

		const link = screen.getByRole('link', { name: /Buy me a coffee/ });
		expect(link.getAttribute('href')).toBe('https://ko-fi.com/gotcrypto');
		expect(link.getAttribute('rel')).toContain('noopener');
	});

	it('stays hidden with fewer transactions, for admins and without an AuthProvider', () => {
		const { unmount } = renderPrompt(4);
		expect(screen.queryByText('Enjoying Got Crypto?')).toBeNull();
		unmount();

		renderPrompt(10, true);
		expect(screen.queryByText('Enjoying Got Crypto?')).toBeNull();

		render(<SupportPrompt transactionCount={10} />);
		expect(screen.queryByText('Enjoying Got Crypto?')).toBeNull();
	});

	it.each(['Maybe later', "Don't show again"])('hides after "%s" and remembers it', (label) => {
		const { unmount } = renderPrompt(5);
		fireEvent.click(screen.getByRole('button', { name: label }));
		expect(screen.queryByText('Enjoying Got Crypto?')).toBeNull();
		unmount();

		renderPrompt(5);
		expect(screen.queryByText('Enjoying Got Crypto?')).toBeNull();
	});
});
