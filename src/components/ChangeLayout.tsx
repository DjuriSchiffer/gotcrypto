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

	return (
		<ButtonGroup>
			{layoutOptions.map((option, index) => (
				<Button
					className={classNames('', {
						'!border-blue-400': dashboardLayout === option.label,
						'!border-l-[1px]': index > 0 && dashboardLayout === option.label,
						'border-l': index > 0 && dashboardLayout === option.label,
					})}
					color={dashboardLayout === option.label ? 'dark' : 'gray'}
					key={option.label}
					onClick={() => {
						handleLayoutChange(option.label);
					}}
					title={option.label}
				>
					{option.symbol}
					{option.label}
				</Button>
			))}
		</ButtonGroup>
	);
}
