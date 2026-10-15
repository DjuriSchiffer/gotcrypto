import { createContext } from 'react';

export type ToastKind = 'error' | 'success';

export type ToastContextType = {
	notify: (kind: ToastKind, message: string) => void;
};

/**
 * Without a ToastProvider (e.g. in a test that renders one component) messages go to the console
 * instead of failing.
 */
export const ToastContext = createContext<ToastContextType>({
	notify: (kind, message) => {
		console.warn(`[${kind}] ${message}`);
	},
});
