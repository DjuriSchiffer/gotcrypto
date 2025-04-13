import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthChoice from './components/AuthChoice';
import ErrorComponent from './components/Error';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Graphs from './pages/Graphs';
import UserSettings from './pages/UserSettings';

function App() {
	const { user } = useAuth();

	return (
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
	);
}
export default App;
