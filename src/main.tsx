import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './providers/AuthProvider';
import ReducerProvider from './providers/ReducerProvider';

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ReducerProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReducerProvider>
  </React.StrictMode>
);
