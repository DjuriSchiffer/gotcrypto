import { Avatar, Badge, Button } from 'flowbite-react';
import { useState } from 'react';
import { FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';

import SaveToGoogle from '../components/account/SaveToGoogle';
import Page from '../components/layout/Page';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsLightDarkMode from '../components/SettingsLightDarkMode';
import SettingsPriceFormat from '../components/SettingsPriceFormat';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { useStorage } from '../hooks/useStorage';
import { signOutUser } from '../services/authService';

const CONFIRM_WORD = 'DELETE';

function UserSettings() {
	const { isAnonymous, user } = useAuth();
	const { selectedCurrencies, setSelectedCurrencies } = useStorage();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const assetCount = selectedCurrencies.length;
	const transactionCount = selectedCurrencies.reduce(
		(sum, asset) => sum + asset.transactions.length,
		0
	);

	const handleDelete = async () => {
		try {
			await setSelectedCurrencies([]);
			setConfirmOpen(false);
		} catch (error) {
			console.error('Failed to delete portfolio data:', error);
			alert('Failed to delete your data. Please try again.');
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
								{isAnonymous ? 'Browser only' : 'Synced with Google'}
							</Badge>
							<Button color="gray" onClick={() => void signOutUser()} size="sm">
								<FaSignOutAlt className="mr-2" />
								Sign out
							</Button>
						</div>
					</div>
					{isAnonymous && <SaveToGoogle />}
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
							onClick={() => {
								setConfirmOpen(true);
							}}
						>
							<FaTrashAlt className="mr-2" />
							Delete portfolio data
						</Button>
					</div>
				</SectionCard>
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
				onClose={() => {
					setConfirmOpen(false);
				}}
				onConfirm={() => void handleDelete()}
				open={confirmOpen}
				requireText={CONFIRM_WORD}
				title="Delete portfolio data?"
			/>
		</Page>
	);
}

export default UserSettings;
