import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import ErrorComponent from './components/Error';
import AuthChoice from './components/AuthChoice';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <AuthChoice />} />
        <Route path="/:slug" element={user ? <Detail /> : <AuthChoice />} />
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
      <ErrorComponent />
    </Router>
  );
};
export default App;
