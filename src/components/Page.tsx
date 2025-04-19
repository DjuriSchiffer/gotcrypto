import type { ReactNode } from 'react';

import classNames from 'classnames';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

import SideBar from './SideBar';

type PageProps = {
	children: ReactNode;
};

function Page({ children }: PageProps) {
	const [isOpen, setIsOpen] = useState(false);
	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	return (
		<main className="min-h-screen bg-white dark:bg-gray-dark">
			<button
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				className={classNames(
					'fixed top-4 right-4 z-20 p-2',
					'bg-white dark:bg-gray-800',
					'rounded-md shadow-sm',
					'lg:hidden'
				)}
				onClick={toggleSidebar}
			>
				{isOpen ? <FaTimes color="white" size={32} /> : <FaBars color="white" size={32} />}
			</button>
			<div className="p-4">
				<div className="grid w-full grid-cols-6 gap-4">
					<div
						className={classNames(
							'fixed z-10 col-span-6 lg:col-span-1',
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
					<div className="col-span-6 lg:col-span-5">{children}</div>
				</div>
			</div>
		</main>
	);
}

export default Page;
