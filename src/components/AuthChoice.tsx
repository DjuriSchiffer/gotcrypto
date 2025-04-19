import { Button, Card } from 'flowbite-react';

import { signInAnonymouslyUser, signInWithGoogle } from '../services/authService';

function AuthChoice() {
	return (
		<main className="min-h-screen bg-white dark:bg-gray-dark">
			<div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
				<h1 className="mb-8 text-3xl">Got Crypto?</h1>
				<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2">
					<Card className="max-w-sm">
						<h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							Sign in with Google
						</h5>
						<p className="mb-4 font-normal text-gray-700 dark:text-gray-400">
							Save your data securely in the cloud and access it from any device.
						</p>
						<ul className="mb-4 text-sm text-gray-700 dark:text-gray-400">
							<li>✅ Persistent storage across devices</li>
							<li>✅ Easy backup and recovery</li>
							<li>⚠️ Requires a Google account</li>
						</ul>
						<Button color="primary" onClick={() => void signInWithGoogle()}>
							Sign in with Google
						</Button>
					</Card>

					<Card className="max-w-sm">
						<h5 className="text-2xl font-bold tracking-tight text-white dark:text-white">
							Browse Anonymously
						</h5>
						<p className="mb-4 font-normal text-gray-700 dark:text-gray-400">
							Store your data locally in your browser. No account required.
						</p>
						<ul className="mb-4 text-sm text-gray-700 dark:text-gray-400">
							<li>✅ Quick and easy setup</li>
							<li>✅ No personal information needed</li>
							<li>⚠️ Data is device-specific and not backed up</li>
						</ul>
						<Button color="primary" onClick={() => void signInAnonymouslyUser()}>
							Continue Anonymously
						</Button>
					</Card>
				</div>
			</div>
		</main>
	);
}

export default AuthChoice;
