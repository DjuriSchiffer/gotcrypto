import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./layout/Page', () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import LoadingErrorWrapper from './LoadingErrorWrapper';

describe('LoadingErrorWrapper', () => {
	it('explains that prices failed to load and offers to try again', () => {
		render(
			<LoadingErrorWrapper fetchedIsLoading={false} isError>
				page
			</LoadingErrorWrapper>
		);

		expect(screen.getByRole('heading', { name: "Prices couldn't be loaded" })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Try again/ })).toBeTruthy();
		expect(screen.queryByText('page')).toBeNull();
	});

	it('shows the page once loaded', () => {
		render(
			<LoadingErrorWrapper fetchedIsLoading={false} isError={false}>
				page
			</LoadingErrorWrapper>
		);

		expect(screen.getByText('page')).toBeTruthy();
	});
});
