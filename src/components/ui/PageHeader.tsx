import type { ReactNode } from 'react';

type PageHeaderProps = {
	actions?: ReactNode;
	description?: string;
	icon?: ReactNode;
	title: string;
};

export function PageHeader({ actions, description, icon, title }: PageHeaderProps) {
	return (
		<header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex items-center gap-4">
				{icon}
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
					{description && <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>}
				</div>
			</div>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</header>
	);
}
