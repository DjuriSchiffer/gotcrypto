import type { IconType } from 'react-icons';

import { Alert, Button, Card, Spinner } from 'flowbite-react';
import { useState } from 'react';
import { FaChartPie, FaExchangeAlt, FaGoogle, FaUserSecret } from 'react-icons/fa';

import logo from '../public/images/logo.svg';
import { signInAnonymouslyUser, signInWithGoogle } from '../services/authService';
import { signInErrorMessage } from '../utils/authErrors';

const FEATURES: Array<{ description: string; icon: IconType; title: string }> = [
	{
		description: 'Cost basis, realized and unrealized profit for every coin.',
		icon: FaChartPie,
		title: 'Know where you stand',
	},
	{
		description: 'Log buys, sells and transfers, with live prices in euros or dollars.',
		icon: FaExchangeAlt,
		title: 'Every transaction in one place',
	},
	{
		description: 'Start in your browser without signing up, and save to Google whenever you like.',
		icon: FaUserSecret,
		title: 'Try it without an account',
	},
];

type Method = 'anonymous' | 'google';

function AuthChoice() {
	const [pending, setPending] = useState<Method | null>(null);
	const [error, setError] = useState<null | string>(null);

	const signIn = async (method: Method) => {
		setPending(method);
		setError(null);
		try {
			await (method === 'google' ? signInWithGoogle() : signInAnonymouslyUser());
			// On success the app switches pages by itself (onAuthStateChanged)
		} catch (signInError) {
			setError(signInErrorMessage(signInError));
			setPending(null);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-dark">
			<div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
				<section className="flex flex-col gap-8">
					<div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
						<img alt="" className="h-8 w-8" src={logo} />
						Got Crypto
					</div>
					<div>
						<h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
							Your crypto portfolio, clearly.
						</h1>
						<p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
							Track what you own, what it cost you and how it's doing.
						</p>
					</div>
					<ul className="flex flex-col gap-5">
						{FEATURES.map(({ description, icon: Icon, title }) => (
							<li className="flex gap-4" key={title}>
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
									<Icon aria-hidden />
								</span>
								<div>
									<p className="font-medium text-gray-900 dark:text-white">{title}</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
								</div>
							</li>
						))}
					</ul>
				</section>

				<Card className="w-full lg:max-w-md lg:justify-self-end">
					<div className="flex flex-col gap-6">
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Get started</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Choose where to keep your portfolio.
							</p>
						</div>

						{error && <Alert color="failure">{error}</Alert>}

						<div className="flex flex-col gap-2">
							<Button
								color="primary"
								disabled={pending !== null}
								onClick={() => void signIn('google')}
							>
								{pending === 'google' ? (
									<Spinner className="mr-2" size="sm" />
								) : (
									<FaGoogle className="mr-2" />
								)}
								Continue with Google
							</Button>
							<p className="text-center text-xs text-gray-500 dark:text-gray-400">
								Saved to your account and available on any device.
							</p>
						</div>

						<div className="flex items-center gap-3 text-xs uppercase text-gray-400">
							<span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
							or
							<span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
						</div>

						<div className="flex flex-col gap-2">
							<Button
								color="gray"
								disabled={pending !== null}
								onClick={() => void signIn('anonymous')}
							>
								{pending === 'anonymous' && <Spinner className="mr-2" size="sm" />}
								Continue without an account
							</Button>
							<p className="text-center text-xs text-gray-500 dark:text-gray-400">
								Stored in this browser only. You can save it to a Google account later.
							</p>
						</div>
					</div>
				</Card>
			</div>
		</main>
	);
}

export default AuthChoice;
