import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, useThemeMode } from 'flowbite-react';
import { useEffect } from 'react';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import { useAuth } from './hooks/useAuth';
import { useStorage } from './hooks/useStorage';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Graphs from './pages/Graphs';
import UserSettings from './pages/UserSettings';
import OnboardingPage from './pages/Onboarding';
import { customTheme } from './theme';

function App() {
	const { user } = useAuth();
	const { setMode } = useThemeMode();
	const { onboardingCompleted, loading } = useStorage();

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

	return (
		<ThemeProvider theme={customTheme}>
			<Router>
				<Routes>
					<Route
						path="/"
						element={
							!user ? (
								<AuthChoice />
							) : !onboardingCompleted ? (
								<Navigate to="/onboarding" replace />
							) : (
								<Dashboard />
							)
						}
					/>

					<Route
						path="/onboarding"
						element={
							!user ? (
								<Navigate to="/" replace />
							) : onboardingCompleted ? (
								<Navigate to="/" replace />
							) : (
								<OnboardingPage />
							)
						}
					/>

					<Route
						path="/:slug"
						element={
							!user ? (
								<AuthChoice />
							) : !onboardingCompleted ? (
								<Navigate to="/onboarding" replace />
							) : (
								<Detail />
							)
						}
					/>

					<Route
						path="/graphs"
						element={
							!user ? (
								<AuthChoice />
							) : !onboardingCompleted ? (
								<Navigate to="/onboarding" replace />
							) : (
								<Graphs />
							)
						}
					/>

					<Route
						path="/user-settings"
						element={
							!user ? (
								<AuthChoice />
							) : !onboardingCompleted ? (
								<Navigate to="/onboarding" replace />
							) : (
								<UserSettings />
							)
						}
					/>

					<Route element={<ErrorComponent />} path="*" />
				</Routes>
				<ErrorComponent />
			</Router>
		</ThemeProvider>
	);
}
export default App;
