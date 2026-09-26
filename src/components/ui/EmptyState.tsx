import type { ReactNode } from "react";

type EmptyStateProps = {
	action?: ReactNode;
	message: string;
};

export function EmptyState({ action, message }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 py-10 text-center">
			<p className="text-gray-600 dark:text-gray-300">{message}</p>
			{action}
		</div>
	);
}
