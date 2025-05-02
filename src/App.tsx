import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Graphs from './pages/Graphs';
import UserSettings from './pages/UserSettings';
import { ThemeProvider, useThemeMode } from 'flowbite-react';
import { useEffect } from 'react';
import { customTheme } from './theme';

function App() {
	const { user } = useAuth();
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

	return (
		<ThemeProvider theme={customTheme}>
			<Router>
				<Routes>
					<Route element={user ? <Dashboard /> : <AuthChoice />} path="/" />
					<Route element={user ? <Detail /> : <AuthChoice />} path="/:slug" />
					<Route element={user ? <Graphs /> : <AuthChoice />} path="/graphs" />
					<Route element={user ? <UserSettings /> : <AuthChoice />} path="/user-settings" />
					<Route element={<ErrorComponent />} path="*" />
				</Routes>
				<ErrorComponent />
			</Router>
		</ThemeProvider>
	);
}
export default App;
