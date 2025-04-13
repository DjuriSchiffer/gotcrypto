import type { IconType } from 'react-icons';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Sidebar } from 'flowbite-react';
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
			<Sidebar.Logo className="mt-3 mb-7" href={to} img={img} imgAlt={imgAlt}>
				{text}
			</Sidebar.Logo>
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
			<Sidebar.Item active={location.pathname === to} className="mb-1" href={to} icon={icon}>
				{text}
			</Sidebar.Item>
		</span>
	);
}

function SideBar() {
	const { isAnonymous, user } = useAuth();
	const location = useLocation();
	const isDashboard = location.pathname === '/';

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			console.log('User signed out');
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

	return (
		<Sidebar
			aria-label="Sidebar"
			className="h-full w-full lg:sticky lg:top-4 lg:h-[calc(100vh_-_32px)]"
		>
			<Sidebar.Items className="flex h-full flex-col">
				<Sidebar.ItemGroup>
					<AppSideBarLogo img={logo} imgAlt="Got Crypto" text="Got Crypto" to="/" />
					{isDashboard ? (
						<AppSideBarItem icon={FaChartPie} text="Dashboard" to="/" />
					) : (
						<AppSideBarItem icon={FaArrowLeft} text="Return to Dashboard" to="/" />
					)}
					<AppSideBarItem icon={FaChartBar} text="Graphs and stats" to="/graphs" />
				</Sidebar.ItemGroup>
				<ChangeQuote className="mt-auto w-full" />
				<Sidebar.ItemGroup>
					<AppSideBarItem icon={FaCog} text="User & Settings" to="/user-settings" />
					{user && !isAnonymous && (
						<Sidebar.Item className="cursor-pointer" icon={FaSignOutAlt} onClick={handleSignOut}>
							Sign Out
						</Sidebar.Item>
					)}
					{user && isAnonymous && (
						<Sidebar.Item
							className="cursor-pointer"
							icon={FaSignInAlt}
							onClick={handleSignInGoogle}
						>
							Sign In
						</Sidebar.Item>
					)}
				</Sidebar.ItemGroup>
			</Sidebar.Items>
		</Sidebar>
	);
}

export default SideBar;
