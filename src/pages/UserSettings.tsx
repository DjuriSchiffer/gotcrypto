import { Avatar, Badge, Button } from 'flowbite-react';
import { useState } from 'react';
import { FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';

import DeleteAccount from '../components/account/DeleteAccount';
import ExportDataCard from '../components/account/ExportDataCard';
import ImportDataCard from '../components/account/ImportDataCard';
import SaveToAccount from '../components/account/SaveToAccount';
import Page from '../components/layout/Page';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsLightDarkMode from '../components/SettingsLightDarkMode';
import SettingsPriceFormat from '../components/SettingsPriceFormat';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { PROVIDER_LABELS } from '../config/authProviders';
import { contactMailto } from '../config/contact';
import { KOFI_URL } from '../config/support';
import { useAppState } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { useToast } from '../hooks/useToast';
import { signOutUser } from '../services/authService';
import { primaryProvider } from '../utils/signInMethod';

const CONFIRM_WORD = 'DELETE';
const linkClass = 'font-medium text-primary-700 hover:underline dark:text-primary-400';
const feedbackLink = contactMailto('Got Crypto feedback');

function UserSettings() {
	const { isAdmin, isAnonymous, user } = useAuth();
	const { currencyQuote } = useAppState();
	const { data: fetchedCurrencies } = useCoinMarketCap(currencyQuote);
	const { selectedCurrencies, setSelectedCurrencies } = useStorage();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const { showError, showSuccess } = useToast();
	const provider = user ? primaryProvider(user) : 'anonymous';

	const assetCount = selectedCurrencies.length;
	const transactionCount = selectedCurrencies.reduce(
		(sum, asset) => sum + asset.transactions.length,
		0
	);

	const handleDelete = async () => {
		try {
			await setSelectedCurrencies([]);
			setConfirmOpen(false);
			showSuccess('Your portfolio data has been deleted.');
		} catch (error) {
			console.error('Failed to delete portfolio data:', error);
			showError("Your data couldn't be deleted. Please try again.");
		}
	};

	return (
		<Page>
			<div className="mb-8 flex w-full max-w-3xl flex-col gap-6">
				<PageHeader description="Your account, preferences and data" title="Settings" />

				<SectionCard title="Account">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex min-w-0 items-center gap-3">
							<Avatar img={user?.photoURL ?? undefined} rounded size="md" />
							<div className="min-w-0">
								<p className="truncate font-medium text-gray-900 dark:text-white">
									{isAnonymous
										? 'Anonymous session'
										: (user?.displayName ?? user?.email ?? 'Signed in')}
								</p>
								{isAnonymous ? (
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Your data is stored in this browser only. It isn't backed up and can't be opened
										on other devices.
									</p>
								) : (
									<p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Badge color={isAnonymous ? 'warning' : 'success'}>
								{isAnonymous || provider === 'anonymous'
									? 'Browser only'
									: `Synced with ${PROVIDER_LABELS[provider]}`}
							</Badge>
							<Button color="gray" onClick={() => void signOutUser()} size="sm">
								<FaSignOutAlt className="mr-2" />
								Sign out
							</Button>
						</div>
					</div>
					{isAnonymous && <SaveToAccount />}
				</SectionCard>

				<SectionCard
					description="Used for all prices and for fetching data from CoinMarketCap"
					title="Currency"
				>
					<SettingsPriceFormat />
				</SectionCard>

				<SectionCard description="How dates are shown throughout the app" title="Date format">
					<SettingsDateFormat />
				</SectionCard>

				<SectionCard description="Light or dark theme" title="Appearance">
					<SettingsLightDarkMode />
				</SectionCard>

				<ExportDataCard
					assets={selectedCurrencies}
					currencyQuote={currencyQuote}
					includeTaxColumn={isAdmin}
					isAnonymous={isAnonymous}
				/>

				<ImportDataCard
					assets={selectedCurrencies}
					currencyQuote={currencyQuote}
					fetchedCurrencies={fetchedCurrencies}
					includeTaxColumn={isAdmin}
					onImport={setSelectedCurrencies}
				/>

				<SectionCard description="These actions can't be undone" title="Danger zone" tone="danger">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="font-medium text-gray-900 dark:text-white">Delete portfolio data</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Removes all your assets and transactions. Your preferences stay.
							</p>
						</div>
						<Button
							color="failure"
							disabled={assetCount === 0}
							onClick={() => { setConfirmOpen(true); }}
						>
							<FaTrashAlt className="mr-2" />
							Delete portfolio data
						</Button>
					</div>
					<div className="border-t border-gray-200 pt-4 dark:border-gray-700">
						<DeleteAccount />
					</div>
				</SectionCard>

				{/* Plain links, so the page also renders outside a router (tests) */}
				<div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
					{feedbackLink && (
						<p>
							Found a bug or have an idea?{' '}
							<a className={linkClass} href={feedbackLink}>
								Send feedback
							</a>
						</p>
					)}
					<p>
						Got Crypto is free and ad-free. Like it?{' '}
						<a className={linkClass} href={KOFI_URL} rel="noopener noreferrer" target="_blank">
							Buy me a coffee
						</a>
					</p>
					<p>
						Read what is stored and how in the{' '}
						<a className={linkClass} href="/privacy">
							privacy statement
						</a>
						.
					</p>
				</div>
			</div>

			<ConfirmModal
				confirmLabel="Delete portfolio data"
				message={
					<>
						This permanently deletes{' '}
						<strong>
							{assetCount} {assetCount === 1 ? 'asset' : 'assets'} and {transactionCount}{' '}
							{transactionCount === 1 ? 'transaction' : 'transactions'}
						</strong>
						{isAnonymous ? ' from this browser' : ' from your account'}. This can't be undone.
					</>
				}
				onClose={() => { setConfirmOpen(false); }}
				onConfirm={() => void handleDelete()}
				open={confirmOpen}
				requireText={CONFIRM_WORD}
				title="Delete portfolio data?"
			/>
		</Page>
	);
}

export default UserSettings;
