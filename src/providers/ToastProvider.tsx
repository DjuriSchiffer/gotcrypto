import type { ReactNode } from 'react';

import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

import type { ToastKind } from '../contexts/ToastContext';

import { ToastContext } from '../contexts/ToastContext';

type Toast = { id: number; kind: ToastKind; message: string };

/** Errors stay longer: they usually need reading */
const VISIBLE_FOR_MS: Record<ToastKind, number> = { error: 8000, success: 4000 };
const MAX_VISIBLE = 3;

const STYLES: Record<ToastKind, { icon: typeof FaCheckCircle; iconClass: string }> = {
	error: {
		icon: FaExclamationCircle,
		iconClass: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
	},
	success: {
		icon: FaCheckCircle,
		iconClass: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
	},
};

/** Shows notifications in the bottom-right corner (bottom of the screen on phones). */
function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Array<Toast>>([]);
	const nextId = useRef(0);
	const timers = useRef(new Map<number, number>());

	const dismiss = useCallback((id: number) => {
		window.clearTimeout(timers.current.get(id));
		timers.current.delete(id);
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const notify = useCallback(
		(kind: ToastKind, message: string) => {
			const id = nextId.current++;
			// The same message twice (e.g. a double click) shows once; old ones make room for new ones
			setToasts((current) =>
				[...current.filter((toast) => toast.message !== message), { id, kind, message }].slice(
					-MAX_VISIBLE
				)
			);
			timers.current.set(
				id,
				window.setTimeout(() => {
					dismiss(id);
				}, VISIBLE_FOR_MS[kind])
			);
		},
		[dismiss]
	);

	useEffect(() => {
		if (!import.meta.env.DEV) return;
		(window as unknown as { toast?: typeof notify }).toast = notify;
	}, [notify]);

	// Don't leave timers running after the app is gone
	useEffect(() => {
		const pending = timers.current;
		return () => {
			pending.forEach((timer) => {
				window.clearTimeout(timer);
			});
		};
	}, []);

	const value = useMemo(() => ({ notify }), [notify]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				aria-label="Notifications"
				className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
				role="region"
			>
				{toasts.map((toast) => {
					const { icon: Icon, iconClass } = STYLES[toast.kind];

					return (
						<div
							className="pointer-events-auto flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
							key={toast.id}
							role={toast.kind === 'error' ? 'alert' : 'status'}
						>
							<span
								className={classNames(
									'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
									iconClass
								)}
							>
								<Icon aria-hidden className="h-4 w-4" />
							</span>
							<p className="flex-1">{toast.message}</p>
							<button
								aria-label="Dismiss"
								className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
								onClick={() => {
									dismiss(toast.id);
								}}
								type="button"
							>
								<FaTimes aria-hidden className="h-3 w-3" />
							</button>
						</div>
					);
				})}
			</div>
		</ToastContext.Provider>
	);
}

export default ToastProvider;
