import type { ReactNode } from 'react';

import classNames from 'classnames';
import { Card } from 'flowbite-react';

import HintIcon from './HintIcon';

type SectionCardProps = {
	/** Buttons or controls shown on the right of the header */
	actions?: ReactNode;
	children: ReactNode;
	description?: string;
	/** Content runs edge to edge, for tables */
	flush?: boolean;
	/** Explanation shown in a tooltip next to the title */
	hint?: string;
	title: string;
	/** 'danger' gives the card a red border, for irreversible actions */
	tone?: 'danger' | 'default';
};

/** A card with a title, an optional description and tooltip, and content below. */
function SectionCard({
	actions,
	children,
	description,
	flush = false,
	hint,
	title,
	tone = 'default',
}: SectionCardProps) {
	return (
		<Card
			className={classNames('h-full', {
				'[&>div]:p-0': flush,
				'border-red-300 dark:border-red-800': tone === 'danger',
			})}
		>
			<div
				className={classNames('flex items-start justify-between gap-4', {
					'p-6 pb-0': flush,
				})}
			>
				<div>
					<h2
						className={classNames('flex items-center gap-2 text-lg font-semibold', {
							'text-gray-900 dark:text-white': tone === 'default',
							'text-red-700 dark:text-red-400': tone === 'danger',
						})}
					>
						{title}
						{hint && <HintIcon hint={hint} />}
					</h2>
					{description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
				</div>
				{actions}
			</div>
			{children}
		</Card>
	);
}

export default SectionCard;
