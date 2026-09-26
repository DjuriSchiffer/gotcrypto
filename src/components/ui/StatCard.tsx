import type { ReactNode } from 'react';

import classNames from 'classnames';
import { Card } from 'flowbite-react';

import HintIcon from './HintIcon';

type StatCardProps = {
	/** Optional line under the value, e.g. a badge or a short note */
	children?: ReactNode;
	/** Explanation shown in a tooltip next to the label */
	hint?: string;
	label: string;
	value: ReactNode;
	valueClassName?: string;
};

function StatCard({ children, hint, label, value, valueClassName }: StatCardProps) {
	return (
		<Card>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
					{label}
					{hint && <HintIcon hint={hint} />}
				</div>
				<div
					className={classNames(
						'text-2xl font-bold tracking-tight text-gray-900 dark:text-white',
						valueClassName
					)}
				>
					{value}
				</div>
				{children && (
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						{children}
					</div>
				)}
			</div>
		</Card>
	);
}

export default StatCard;
