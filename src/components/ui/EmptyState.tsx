import type { ReactNode } from 'react';

import classNames from 'classnames';

type EmptyStateProps = {
	action?: ReactNode;
	compact?: boolean;
	message: string;
};

function EmptyState({ action, compact = false, message }: EmptyStateProps) {
	return (
		<div
			className={classNames('flex flex-col items-center gap-4 text-center', {
				'py-4': compact,
				'py-10': !compact,
			})}
		>
			<p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
			{action}
		</div>
	);
}

export default EmptyState;
