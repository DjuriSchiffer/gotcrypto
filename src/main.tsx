import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import './index.css';

import * as ReactDOM from 'react-dom/client';

import App from './App';
import ErrorScreen from './components/ErrorScreen';
import { AuthProvider } from './providers/AuthProvider';
import ReducerProvider from './providers/ReducerProvider';
import StorageProvider from './providers/StorageProvider';

// Error reporting. What it collects is described on the privacy page: keep the two in sync.
Sentry.init({
	dsn: 'https://b43fcdae2a1880738921aac9caf37b80@o4508432783245312.ingest.de.sentry.io/4508432787570768',
	// Only the live site reports errors; local development stays on your machine
	enabled: import.meta.env.PROD,
	environment: import.meta.env.MODE,
	integrations: [
		Sentry.browserTracingIntegration(),
		// Hides everything on screen in recordings: amounts, names, inputs and images
		Sentry.replayIntegration({ blockAllMedia: true, maskAllInputs: true, maskAllText: true }),
	],
	// Record only the moments before an error, never ordinary visits
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0,
	// Don't send IP addresses, cookies or other personal details
	sendDefaultPii: false,
	tracePropagationTargets: [/^https:\/\/gotcrypto\.nl/],
	// Performance Monitoring
	tracesSampleRate: 1.0,
});

// Create Query Client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create and render root
ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		{/* If the app crashes, show a friendly screen instead of a blank page; Sentry gets the report */}
		<Sentry.ErrorBoundary
			fallback={({ eventId }) => <ErrorScreen eventId={eventId || undefined} />}
		>
			<ReducerProvider>
				<AuthProvider>
					<StorageProvider>
						<QueryClientProvider client={queryClient}>
							<App />
						</QueryClientProvider>
					</StorageProvider>
				</AuthProvider>
			</ReducerProvider>
		</Sentry.ErrorBoundary>
	</React.StrictMode>
);
