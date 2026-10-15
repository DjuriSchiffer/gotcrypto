import { useContext, useMemo } from 'react';

import { ToastContext } from '../contexts/ToastContext';

/** Shows a short notification in the corner of the screen. */
export const useToast = () => {
	const { notify } = useContext(ToastContext);

	return useMemo(
		() => ({
			showError: (message: string) => {
				notify('error', message);
			},
			showSuccess: (message: string) => {
				notify('success', message);
			},
		}),
		[notify]
	);
};
