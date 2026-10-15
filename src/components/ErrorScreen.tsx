import { FaRedo } from 'react-icons/fa';

import { contactMailto } from '../config/contact';
import ErrorState from './ui/ErrorState';

type ErrorScreenProps = {
	/** Sentry's id for this crash, so a report can be matched to it */
	eventId?: string;
};

// Plain buttons and links: this screen replaces the whole app, so the router and theme are gone
const primaryButton =
	'inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800';
const secondaryButton =
	'inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-700';

/** Shown instead of the app when it crashes. */
function ErrorScreen({ eventId }: ErrorScreenProps) {
	const reportLink = contactMailto(
		'Got Crypto: something went wrong',
		eventId ? `Error reference: ${eventId}\n\nWhat were you doing when it happened?\n` : undefined
	);

	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-dark">
			<div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<ErrorState
					actions={
						<>
							<button
								className={primaryButton}
								onClick={() => {
									window.location.reload();
								}}
								type="button"
							>
								<FaRedo aria-hidden className="mr-2 h-3 w-3" />
								Reload page
							</button>
							<a className={secondaryButton} href="/">
								Go to dashboard
							</a>
						</>
					}
					message="Sorry, the app ran into an unexpected problem. Your portfolio is saved and wasn't affected. Reloading the page usually fixes this."
					title="Something went wrong"
				>
					{reportLink && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Keeps happening?{' '}
							<a
								className="font-medium text-primary-700 hover:underline dark:text-primary-400"
								href={reportLink}
							>
								Let me know
							</a>
						</p>
					)}
					{eventId && (
						<p className="text-xs text-gray-400 dark:text-gray-500">
							Error reference: <code>{eventId}</code>
						</p>
					)}
				</ErrorState>
			</div>
		</main>
	);
}

export default ErrorScreen;
