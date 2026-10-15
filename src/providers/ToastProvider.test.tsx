import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToast } from '../hooks/useToast';
import ToastProvider from './ToastProvider';

/** Buttons that trigger notifications, as a page would */
function Trigger({ message = 'Saving failed.' }: { message?: string }) {
	const { showError, showSuccess } = useToast();
	return (
		<>
			<button
				onClick={() => {
					showError(message);
				}}
				type="button"
			>
				error
			</button>
			<button
				onClick={() => {
					showSuccess('Saved.');
				}}
				type="button"
			>
				success
			</button>
		</>
	);
}

const renderWithProvider = (message?: string) =>
	render(
		<ToastProvider>
			<Trigger message={message} />
		</ToastProvider>
	);

const click = (name: string) => {
	fireEvent.click(screen.getByRole('button', { name }));
};

describe('ToastProvider', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('announces errors as alerts and successes as status messages', () => {
		renderWithProvider();

		click('error');
		click('success');

		expect(screen.getByRole('alert').textContent).toBe('Saving failed.');
		expect(screen.getByRole('status').textContent).toBe('Saved.');
	});

	it('closes a message with its dismiss button', () => {
		renderWithProvider();
		click('error');

		click('Dismiss');

		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('hides successes after 4 seconds and errors after 8', () => {
		renderWithProvider();
		click('error');
		click('success');

		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(screen.queryByRole('status')).toBeNull();
		expect(screen.getByRole('alert')).toBeTruthy();

		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('shows the same message only once', () => {
		renderWithProvider();

		click('error');
		click('error');

		expect(screen.getAllByRole('alert')).toHaveLength(1);
	});

	it('shows at most three messages, dropping the oldest', () => {
		const { rerender } = renderWithProvider('first');
		click('error');
		for (const message of ['second', 'third', 'fourth']) {
			rerender(
				<ToastProvider>
					<Trigger message={message} />
				</ToastProvider>
			);
			click('error');
		}

		expect(screen.getAllByRole('alert').map((toast) => toast.textContent)).toEqual([
			'second',
			'third',
			'fourth',
		]);
	});
});

describe('useToast without a provider', () => {
	it('logs the message instead of failing', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		render(<Trigger />);

		click('error');

		expect(warn).toHaveBeenCalledWith('[error] Saving failed.');
		warn.mockRestore();
	});
});
