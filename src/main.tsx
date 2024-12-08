import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './providers/AuthProvider';
import ReducerProvider from './providers/ReducerProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: "https://b43fcdae2a1880738921aac9caf37b80@o4508432783245312.ingest.de.sentry.io/4508432787570768",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/yourserver\.io\/api/
  ],
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Create Sentry Error Boundary
const SentryErrorBoundary = Sentry.ErrorBoundary;

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create and render root
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div>An error has occurred</div>}>
      <ReducerProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AuthProvider>
      </ReducerProvider>
    </SentryErrorBoundary>
  </React.StrictMode>
);