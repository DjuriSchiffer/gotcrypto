import { ThemeProvider, useThemeMode } from 'flowbite-react';
import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import LoadingIndicator from './components/LoadingIndicator';
import { useAuth } from './hooks/useAuth';
import { useStorage } from './hooks/useStorage';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Graphs from './pages/Graphs';
import OnboardingPage from './pages/Onboarding';
import UserSettings from './pages/UserSettings';
import { customTheme } from './theme';

function App() {
	const { loading: authLoading, user } = useAuth();
	const { loading: storageLoading, onboardingCompleted } = useStorage();
	const { setMode } = useThemeMode();

	useEffect(() => {
		const storedMode = localStorage.getItem('flowbite-theme-mode');
		const htmlElement = document.documentElement;

		if (!storedMode) {
			void setMode('dark');
			htmlElement.classList.add('dark');
		} else if (storedMode === 'light') {
			void setMode('light');
			htmlElement.classList.remove('dark');
		} else if (storedMode === 'dark' || storedMode === 'auto') {
			void setMode('dark');
			htmlElement.classList.add('dark');
		}
	}, [setMode]);

	const isLoading = authLoading || (user !== null && storageLoading);

	const protectedPage = (page: React.ReactNode) => {
		if (!user) return <AuthChoice />;
		if (!onboardingCompleted) return <Navigate replace to="/onboarding" />;
		return page;
	};

	return (
		<ThemeProvider theme={customTheme}>
			{isLoading ? (
				<main className="min-h-screen bg-gray-50 dark:bg-gray-dark">
					<LoadingIndicator message="Loading..." />
				</main>
			) : (
				<Router>
					<Routes>
						<Route element={protectedPage(<Dashboard />)} path="/" />
						<Route
							element={
								!user || onboardingCompleted ? <Navigate replace to="/" /> : <OnboardingPage />
							}
							path="/onboarding"
						/>
						<Route element={protectedPage(<Graphs />)} path="/graphs" />
						<Route element={protectedPage(<UserSettings />)} path="/user-settings" />
						<Route element={protectedPage(<Detail />)} path="/:slug" />
					</Routes>
					<ErrorComponent />
				</Router>
			)}
		</ThemeProvider>
	);
}

export default App;
