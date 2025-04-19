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
		<ButtonGroup className="">
			{layoutOptions.map((option, index) => (
				<Button
					className={classNames('!border-0', {
						'z-10 !border-[1px] !border-green-400': dashboardLayout === option.label,

						'!rounded-l-lg': index === 0,
						'!rounded-r-lg': index === layoutOptions.length - 1,
						'!rounded-none': index > 0 && index < layoutOptions.length - 1,

						'!first:border-l-0': index === 0,
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
