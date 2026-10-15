import { ThemeProvider, useThemeMode } from 'flowbite-react';
import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import LoadingIndicator from './components/LoadingIndicator';
import { useAuth } from './hooks/useAuth';
import useCoinMarketCap from './hooks/useCoinMarketCap';
import { useStorage } from './hooks/useStorage';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Insights from './pages/Insights';
import OnboardingPage from './pages/Onboarding';
import Privacy from './pages/Privacy';
import UserSettings from './pages/UserSettings';
import ToastProvider from './providers/ToastProvider';
import { customTheme } from './theme';

function CrashTest(): never {
	throw new Error('Crash test');
}

function App() {
	const { loading: authLoading, user } = useAuth();
	const { currencyQuote, loading: storageLoading, onboardingCompleted } = useStorage();

	const { isPending: currenciesPending } = useCoinMarketCap(currencyQuote, {
		enabled: user !== null && !storageLoading,
	});

	const { setMode } = useThemeMode();

	useEffect(() => {
		const storedMode = localStorage.getItem('flowbite-theme-mode');
		const htmlElement = document.documentElement;

		if (!storedMode) {
			setMode('dark');
			htmlElement.classList.add('dark');
		} else if (storedMode === 'light') {
			setMode('light');
			htmlElement.classList.remove('dark');
		} else if (storedMode === 'dark' || storedMode === 'auto') {
			setMode('dark');
			htmlElement.classList.add('dark');
		}
	}, [setMode]);

	const isLoading = authLoading || (user !== null && (storageLoading || currenciesPending));

	const protectedPage = (page: React.ReactNode) => {
		if (!user) return <AuthChoice />;
		if (!onboardingCompleted) return <Navigate replace to="/onboarding" />;
		return page;
	};

	return (
		<ThemeProvider theme={customTheme}>
			<ToastProvider>
				{isLoading ? (
					<main className="min-h-screen bg-gray-50 dark:bg-gray-dark">
						<LoadingIndicator message="Loading your portfolio..." />
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
							<Route element={protectedPage(<Insights />)} path="/insights" />
							<Route element={protectedPage(<UserSettings />)} path="/user-settings" />
							<Route element={<Privacy />} path="/privacy" />
							<Route element={protectedPage(<Detail />)} path="/:slug" />
							{import.meta.env.DEV && <Route element={<CrashTest />} path="/crash-test" />}
						</Routes>
						<ErrorComponent />
					</Router>
				)}
			</ToastProvider>
		</ThemeProvider>
	);
}

export default App;
