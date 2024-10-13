import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Page from './Page';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAnonymous } = useAuth();

  if (loading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
          loggin in...
        </div>
      </Page>
    );
  }

  if (!user || isAnonymous) {
    // Redirect anonymous or unauthenticated users to the home/auth choice page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
