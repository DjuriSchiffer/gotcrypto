import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Badge, Sidebar, SidebarCTA, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo } from 'flowbite-react';
import {
	FaArrowLeft,
	FaChartBar,
	FaChartPie,
	FaCog,
	FaSignInAlt,
	FaSignOutAlt,
} from 'react-icons/fa';
import { useLinkClickHandler, useLocation } from 'react-router-dom';

import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import logo from '../public/images/logo.svg';
import { ChangeQuote } from './ChangeQuote';

// Constants for localStorage
const CTA_DISMISSED_KEY = 'gotcrypto_cta_dismissed';

export type AppSideBarLogoProps = {
	img: string;
	imgAlt: string;
	text: string;
	to: string;
};
function AppSideBarLogo({ img, imgAlt, text, to }: AppSideBarLogoProps) {
	const clickHandler = useLinkClickHandler(to);

	return (
		<span onClick={clickHandler}>
			<SidebarLogo className="mt-3 mb-7" href={to} img={img} imgAlt={imgAlt}>
				{text}
			</SidebarLogo>
		</span>
	);
}

export type AppSideBarItemProps = {
	icon: IconType;
	text: string;
	to: string;
};
function AppSideBarItem({ icon, text, to }: AppSideBarItemProps) {
	const location = useLocation();
	const clickHandler = useLinkClickHandler(to);

	return (
		<span onClick={clickHandler}>
			<SidebarItem active={location.pathname === to} className="mb-1" href={to} icon={icon}>
				{text}
			</SidebarItem>
		</span>
	);
}

function SideBar() {
	const { isAnonymous, user } = useAuth();
	const location = useLocation();
	const isDashboard = location.pathname === '/';
	const [showCTA, setShowCTA] = useState(false);

	// Check localStorage on component mount to determine if CTA should be shown
	useEffect(() => {
		if (isAnonymous) {
			const ctaDismissed = localStorage.getItem(CTA_DISMISSED_KEY) === 'true';
			setShowCTA(!ctaDismissed);
		} else {
			setShowCTA(false);
		}
	}, [isAnonymous]);

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			console.log('User signed out');
			// Clear the dismissed state when user signs out
			localStorage.removeItem(CTA_DISMISSED_KEY);
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const handleSignInGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);

			// The Auth Context will automatically update the user state
			// You can handle additional user setup here if needed
			console.log('User signed in:', result.user);
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error during sign-in:', error.message);
			} else {
				console.error('Unknown error during sign-in');
			}
		}
	};

	const handleDismissCTA = () => {
		// Store the user's preference in localStorage
		localStorage.setItem(CTA_DISMISSED_KEY, 'true');
		setShowCTA(false);
	};

	return (
		<Sidebar
			aria-label="Sidebar"
			className="h-full w-full lg:sticky lg:top-4 lg:h-[calc(100vh_-_32px)]"
		>
			<SidebarItems className="flex h-full flex-col">
				<SidebarItemGroup>
					<AppSideBarLogo img={logo} imgAlt="Got Crypto" text="Got Crypto" to="/" />
					{isDashboard ? (
						<AppSideBarItem icon={FaChartPie} text="Dashboard" to="/" />
					) : (
						<AppSideBarItem icon={FaArrowLeft} text="Return to Dashboard" to="/" />
					)}
					<AppSideBarItem icon={FaChartBar} text="Graphs and stats" to="/graphs" />
				</SidebarItemGroup>
				<ChangeQuote className="mt-auto w-full" />
				<SidebarItemGroup>
					{isAnonymous && (
						<div className="text-md mb-3 ml-3 font-medium dark:text-white">
							<span className="flex items-center">
								<span className="mr-2 h-2 w-2 rounded-full bg-yellow-400"></span>
								Anonymous session
							</span>
						</div>
					)}
					{user && !isAnonymous && (
						<div className="text-md mb-3 ml-3 font-medium dark:text-white">
							<span className="flex items-center">
								<span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
								Signed in with Google
							</span>
						</div>
					)}

					<AppSideBarItem icon={FaCog} text="User & Settings" to="/user-settings" />
					{user && !isAnonymous && (
						<SidebarItem className="cursor-pointer" icon={FaSignOutAlt} onClick={handleSignOut}>
							Sign Out
						</SidebarItem>
					)}
					{isAnonymous && showCTA && (
						<SidebarCTA>
							<div className="mb-3 flex items-center">
								<Badge color="warning">Heads up</Badge>
								<button
									aria-label="Dismiss"
									className="text-cyan-900 -m-1.5 ml-auto inline-flex h-6 w-6 rounded-lg bg-gray-100 p-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
									type="button"
									onClick={handleDismissCTA}
								>
									<svg
										aria-hidden
										className="h-4 w-4"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>

							<div className="text-cyan-900 mb-3 text-sm dark:text-gray-400">
								You're currently in an anonymous session. Your data will be saved on this browser,
								but can't be accessed from other devices. Sign in to unlock cloud backup and
								multi-device access.
							</div>
						</SidebarCTA>
					)}
					{isAnonymous && (
						<SidebarItem
							className="cursor-pointer"
							icon={FaSignInAlt}
							onClick={handleSignInGoogle}
						>
							Sign In
						</SidebarItem>
					)}
				</SidebarItemGroup>
			</SidebarItems>
		</Sidebar>
	);
}

export default SideBar;
