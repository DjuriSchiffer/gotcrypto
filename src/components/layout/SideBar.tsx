import type { IconType } from 'react-icons';

import classNames from 'classnames';
import { Avatar, Button } from 'flowbite-react';
import { FaChartBar, FaChartPie, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import logo from '../../public/images/logo.svg';
import { signOutUser } from '../../services/authService';

type NavItem = {
	icon: IconType;
	label: string;
	to: string;
};

const NAV_ITEMS: Array<NavItem> = [
	{ icon: FaChartPie, label: 'Dashboard', to: '/' },
	{ icon: FaChartBar, label: 'Insights', to: '/insights' },
	{ icon: FaCog, label: 'Settings', to: '/user-settings' },
];

const isActive = (item: NavItem, pathname: string) => {
	if (item.to !== '/') return pathname.startsWith(item.to);
	return !NAV_ITEMS.some((other) => other.to !== '/' && pathname.startsWith(other.to));
};

export function Brand() {
	return (
		<Link
			className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
			to="/"
		>
			<img alt="" className="h-8 w-8" src={logo} />
			Got Crypto
		</Link>
	);
}

type SideBarProps = {
	/** Called after picking a page, so the mobile drawer can close */
	onNavigate?: () => void;
	/** The drawer shows its own header, so it can hide the brand */
	showBrand?: boolean;
};

function SideBar({ onNavigate, showBrand = true }: SideBarProps) {
	const { pathname } = useLocation();
	const { isAnonymous, user } = useAuth();

	return (
		<div className="flex h-full flex-col gap-6">
			{showBrand && (
				<div className="px-2">
					<Brand />
				</div>
			)}

			<nav aria-label="Main">
				<ul className="flex flex-col gap-1">
					{NAV_ITEMS.map((item) => {
						const active = isActive(item, pathname);
						const Icon = item.icon;

						return (
							<li key={item.to}>
								<Link
									aria-current={active ? 'page' : undefined}
									className={classNames(
										'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										active
											? 'bg-primary-50 text-primary-700 dark:bg-primary-900/90 dark:text-primary-300'
											: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
									)}
									onClick={onNavigate}
									to={item.to}
								>
									<Icon aria-hidden className="h-4 w-4" />
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="mt-auto flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
				<div className="flex items-center gap-3 px-2">
					<Avatar img={user?.photoURL ?? undefined} rounded size="sm" />
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
							{isAnonymous
								? 'Anonymous session'
								: (user?.displayName ?? user?.email ?? 'Signed in')}
						</p>
						{isAnonymous ? (
							<Link
								className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
								onClick={onNavigate}
								to="/user-settings"
							>
								Browser only · Save to Google
							</Link>
						) : (
							<p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
						)}
					</div>
				</div>
				<Button color="gray" onClick={() => void signOutUser()} size="sm">
					<FaSignOutAlt className="mr-2" />
					Sign out
				</Button>
			</div>
		</div>
	);
}

export default SideBar;
