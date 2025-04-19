import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Graphs from './pages/Graphs';
import UserSettings from './pages/UserSettings';
import { createTheme, ThemeProvider } from 'flowbite-react';

const customTheme = createTheme({
	button: {
		color: {
			primary: 'bg-green-500 hover:bg-green-600 text-white',
			failure: 'bg-red-600 hover:bg-red-700 text-white',
		},
		size: {
			icon: 'text-sm h-9 w-auto px-5',
		},
	},
});

function App() {
	const { user } = useAuth();

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
