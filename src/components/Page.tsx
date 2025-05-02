import type { ReactNode } from 'react';

import classNames from 'classnames';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

import SideBar from './SideBar';
import { useThemeMode } from 'flowbite-react';

type PageProps = {
	children: ReactNode;
};

function Page({ children }: PageProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';
	const [isOpen, setIsOpen] = useState(false);
	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-dark">
			<button
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				className={classNames(
					'fixed top-4 right-4 z-30 p-2',
					'bg-white dark:bg-gray-800',
					'rounded-md shadow-sm',
					'lg:hidden'
				)}
				onClick={toggleSidebar}
			>
				{isOpen ? (
					<FaTimes color={isDarkMode ? 'white' : 'dark'} size={32} />
				) : (
					<FaBars color={isDarkMode ? 'white' : 'dark'} size={32} />
				)}
			</button>
			<div className="grid w-full grid-cols-6 gap-4">
				<div
					className={classNames(
						'fixed z-20 col-span-6 lg:col-span-1',
						'top-0 bottom-0',
						'transition-all duration-300',
						{
							'-left-full right-full': !isOpen,
							'left-0 right-0': isOpen,
						},
						'lg:static lg:left-auto lg:right-auto lg:z-auto'
					)}
				>
					<SideBar />
				</div>
				<div className="col-span-6 py-4 pr-4 pl-4 lg:col-span-5 lg:pl-0">{children}</div>
			</div>
		</main>
	);
}

export default Page;
