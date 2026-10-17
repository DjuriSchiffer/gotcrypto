import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CoinMarketCapAttribution from './CoinMarketCapAttribution';

describe('CoinMarketCapAttribution', () => {
	it('credits CoinMarketCap with a link that opens safely in a new tab', () => {
		render(<CoinMarketCapAttribution />);

		const link = screen.getByRole('link', { name: 'CoinMarketCap.com' });
		expect(link.getAttribute('href')).toBe('https://coinmarketcap.com');
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toContain('noopener');
		expect(screen.getByText(/Data provided by/)).toBeTruthy();
	});

	it('stays fixed in the bottom-right corner of the screen', () => {
		render(<CoinMarketCapAttribution />);

		const credit = screen.getByText(/Data provided by/);
		expect(credit.className).toContain('fixed');
		expect(credit.className).toContain('bottom-2');
		expect(credit.className).toContain('right-3');
	});
});
