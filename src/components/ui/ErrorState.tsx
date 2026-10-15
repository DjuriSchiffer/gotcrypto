import type { ReactNode } from 'react';

import { FaExclamationTriangle } from 'react-icons/fa';

type ErrorStateProps = {
	/** Buttons, e.g. "Try again" */
	actions?: ReactNode;
	/** Extra lines below the actions, e.g. a contact link */
	children?: ReactNode;
	message: ReactNode;
	title: string;
};

/** Explains that something went wrong and what to do now. Used inside a card, modal or page. */
function ErrorState({ actions, children, message, title }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 py-6 text-center">
			<span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
				<FaExclamationTriangle aria-hidden className="h-5 w-5 text-red-600 dark:text-red-400" />
			</span>
			<div className="flex max-w-md flex-col gap-1">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
			</div>
			{actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
			{children}
		</div>
	);
}

export default ErrorState;
