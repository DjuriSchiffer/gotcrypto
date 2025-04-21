import type { DashboardLayout } from 'store';

import classNames from 'classnames';
import { Button, ButtonGroup } from 'flowbite-react';
import { useMemo } from 'react';
import { FaTh, FaThList } from 'react-icons/fa';

import { useStorage } from '../hooks/useStorage';

type LayoutOption = {
	label: DashboardLayout;
	symbol: React.ReactNode;
};

export function ChangeLayout() {
	const { dashboardLayout, setDashboardLayout } = useStorage();

	const handleLayoutChange = (layout: DashboardLayout) => {
		void setDashboardLayout(layout);
	};

	const layoutOptions: Array<LayoutOption> = useMemo(
		() => [
			{
				label: 'Grid',
				symbol: <FaTh className="mr-1" />,
			},
			{
				label: 'Table',
				symbol: <FaThList className="mr-1" />,
			},
		],
		[]
	);

	const getButtonStyles = (label: DashboardLayout) => {
		const isActive = dashboardLayout === label;

		return isActive
			? 'bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-dark dark:hover:bg-gray-900 dark:text-white'
			: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200';
	};

	return (
		<ButtonGroup>
			{layoutOptions.map((option, index) => (
				<Button
					key={option.label}
					onClick={() => {
						handleLayoutChange(option.label);
					}}
					title={option.label}
					color="gray"
					className={classNames('!border-0', getButtonStyles(option.label), {
						'z-10 !border-[1px] !border-green-400 dark:!border-green-500':
							dashboardLayout === option.label,
						'!rounded-l-lg': index === 0,
						'!rounded-r-lg': index === layoutOptions.length - 1,
						'!rounded-none': index > 0 && index < layoutOptions.length - 1,
						'!first:border-l-0': index === 0,
					})}
				>
					{option.symbol}
					{option.label}
				</Button>
			))}
		</ButtonGroup>
	);
}
