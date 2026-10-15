import type { ReactNode } from 'react';

import { Card } from 'flowbite-react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { PRIVACY } from '../config/privacy';
import logo from '../public/images/logo.svg';

function Section({ children, title }: { children: ReactNode; title: string }) {
	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
			{children}
		</section>
	);
}

const linkClass = 'font-medium text-primary-700 hover:underline dark:text-primary-400';

/**
 * The privacy statement. Public: it must be readable before signing in, so it doesn't use the
 * app layout (whose sidebar needs a signed-in user).
 */
function Privacy() {
	const email = (
		<a className={linkClass} href={`mailto:${PRIVACY.contactEmail}`}>
			{PRIVACY.contactEmail}
		</a>
	);

	return (
		<main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-dark">
			<div className="mx-auto flex max-w-3xl flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
						<img alt="" className="h-8 w-8" src={logo} />
						Got Crypto
					</div>
					<Link className={`flex items-center gap-2 text-sm ${linkClass}`} to="/">
						<FaArrowLeft aria-hidden />
						Back to the app
					</Link>
				</div>

				<Card>
					<article className="flex flex-col gap-6 text-gray-700 dark:text-gray-300">
						<header>
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy</h1>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Last updated {PRIVACY.lastUpdated}
							</p>
						</header>

						<p>
							Got Crypto is a personal, non-commercial project by {PRIVACY.contactName}. This page
							explains what the app stores about you, where, and how you can see or delete it. In
							short: only what's needed to show you your portfolio, no advertising, no analytics and
							no selling of data.
						</p>

						<Section title="Who is responsible">
							<p>
								{PRIVACY.contactName} is responsible for your data (the &quot;controller&quot; under
								the GDPR). For any question or request about your data, email {email}.
							</p>
						</Section>

						<Section title="What is stored">
							<ul className="list-disc space-y-2 pl-5">
								<li>
									<strong>If you sign in with Google:</strong> your name, email address and profile
									picture, as Google shares them, so you can sign in on any device.
								</li>
								<li>
									<strong>Your portfolio:</strong> the coins you add and your transactions (dates,
									amounts, prices and any notes you write), plus your settings such as currency and
									date format.
								</li>
								<li>
									<strong>Error reports:</strong> when something goes wrong, technical details about
									the error, your browser and the page you were on, with a recording of the moments
									before the error. In that recording all text, numbers, inputs and images are hidden,
									so it doesn&apos;t show your amounts or names.
								</li>
								<li>
									<strong>Server logs:</strong> like any website, the hosting keeps short-lived logs
									of requests, including IP addresses, to deliver the site and keep it secure.
								</li>
							</ul>
						</Section>

						<Section title="Where it is stored">
							<ul className="list-disc space-y-2 pl-5">
								<li>
									<strong>Signed in with Google:</strong> your portfolio and settings are stored in
									Google Firebase (Cloud Firestore, location {PRIVACY.firestoreLocation}). Sign-in is
									handled by Firebase Authentication.
								</li>
								<li>
									<strong>Without an account:</strong> your portfolio and settings stay in this
									browser and are never sent to us. Firebase only creates a random ID for the session.
								</li>
								<li>
									<strong>Error reports</strong> are handled by Sentry, on servers in the EU
									(Germany).
								</li>
								<li>
									<strong>The website</strong> is hosted by Vercel.
								</li>
								<li>
									<strong>Prices</strong> come from CoinMarketCap through our own server. No personal
									data is sent to CoinMarketCap.
								</li>
							</ul>
							<p>
								Google, Sentry and Vercel process this data on our behalf. Google and Vercel are US
								companies; transfers outside the EU are covered by the EU–US Data Privacy Framework
								and standard contractual clauses.
							</p>
						</Section>

						<Section title="Why">
							<p>
								Your account and portfolio are stored because you asked the app to keep track of
								them; without them it can&apos;t work. Error reports and server logs are kept
								because there is a legitimate interest in finding bugs and keeping the app secure.
							</p>
						</Section>

						<Section title="Cookies and browser storage">
							<p>
								There are no advertising or tracking cookies and no analytics. The app stores your
								sign-in session, your settings and (without an account) your portfolio in your
								browser, only because the app needs them to work.
							</p>
						</Section>

						<Section title="How long">
							<p>
								Your data is kept until you delete it. Deleting your account removes your portfolio,
								settings and login right away. Error reports are deleted automatically after at most
								90 days.
							</p>
						</Section>

						<Section title="Your rights">
							<ul className="list-disc space-y-2 pl-5">
								<li>
									<strong>See and take your data:</strong> the export in Settings downloads all your
									transactions as a CSV file.
								</li>
								<li>
									<strong>Correct it:</strong> edit or remove any transaction in the app.
								</li>
								<li>
									<strong>Delete it:</strong> use Delete account in Settings.
								</li>
								<li>
									<strong>Anything else</strong>, such as objecting to how your data is used: email{' '}
									{email}.
								</li>
							</ul>
							<p>
								You can also file a complaint with the Dutch data protection authority,{' '}
								<a
									className={linkClass}
									href="https://autoriteitpersoonsgegevens.nl"
									rel="noreferrer"
									target="_blank"
								>
									Autoriteit Persoonsgegevens
								</a>
								.
							</p>
						</Section>

						<Section title="Changes">
							<p>
								If this page changes, the date at the top changes with it. Important changes will be
								announced in the app.
							</p>
						</Section>
					</article>
				</Card>
			</div>
		</main>
	);
}

export default Privacy;
