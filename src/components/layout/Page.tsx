import type { ReactNode } from 'react';

import { Button, Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

import SideBar, { Brand } from './SideBar';

type PageProps = {
	children: ReactNode;
};

function Page({ children }: PageProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const closeMenu = () => { setMenuOpen(false); };

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-dark">
			<header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90 lg:hidden">
				<Brand />
				<Button
					aria-controls="main-menu"
					aria-expanded={menuOpen}
					aria-label="Open menu"
					color="gray"
					onClick={() => { setMenuOpen(true); }}
					size="sm"
				>
					<FaBars />
				</Button>
			</header>

			<Drawer className="lg:hidden" id="main-menu" onClose={closeMenu} open={menuOpen}>
				<DrawerHeader title="Menu" titleIcon={() => null} />
				<DrawerItems className="h-[calc(100%-3rem)]">
					<SideBar onNavigate={closeMenu} showBrand={false} />
				</DrawerItems>
			</Drawer>

			<div className="lg:flex">
				<aside className="hidden border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0">
					<SideBar />
				</aside>

				<main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
					<div className="mx-auto max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}

export default Page;
