import type { ReactNode } from 'react';

import { Button, Card, Progress, Spinner } from 'flowbite-react';
import { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import AssetSelector from '../components/AssetSelector';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsLightDarkMode from '../components/SettingsLightDarkMode';
import SettingsPriceFormat from '../components/SettingsPriceFormat';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import logo from '../public/images/logo.svg';
import { signOutUser } from '../services/authService';
import { applyAssetChanges } from '../utils/assets';
import { getImage } from '../utils/images';

type Step = {
	description: string;
	title: string;
};

const STEPS: Array<Step> = [
	{
		description: 'Pick the coins you want to track. You can change this later.',
		title: 'Choose your coins',
	},
	{ description: 'Choose how prices and dates are shown.', title: 'Set your preferences' },
	{
		description: 'Your dashboard is ready. Add your first transactions from there.',
		title: "You're all set",
	},
];

function PreferenceGroup({
	children,
	description,
	title,
}: {
	children: ReactNode;
	description: string;
	title: string;
}) {
	return (
		<section className="flex flex-col gap-3">
			<div>
				<h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
			</div>
			{children}
		</section>
	);
}

function OnboardingPage() {
	const navigate = useNavigate();
	const { currencyQuote, selectedCurrencies, setOnboardingCompleted, setSelectedCurrencies } =
		useStorage();
	const { data: fetchedCurrencies, isLoading } = useCoinMarketCap(currencyQuote);

	const [step, setStep] = useState(0);
	const [selectedIds, setSelectedIds] = useState<Array<number>>([]);
	const [isSaving, setIsSaving] = useState(false);

	const isFirstStep = step === 0;
	const isLastStep = step === STEPS.length - 1;
	const chosenCoins = (fetchedCurrencies ?? []).filter((coin) => selectedIds.includes(coin.cmc_id));
	const { description, title } = STEPS[step];

	const toggleCoin = (cmcId: number) =>
		{ setSelectedIds((previous) =>
			previous.includes(cmcId) ? previous.filter((id) => id !== cmcId) : [...previous, cmcId]
		); };

	/** Saves the chosen coins (if any) and marks onboarding as done. */
	const finish = async (saveCoins: boolean) => {
		setIsSaving(true);
		try {
			if (saveCoins && chosenCoins.length > 0) {
				await setSelectedCurrencies(applyAssetChanges(selectedCurrencies, chosenCoins, []));
			}
			await setOnboardingCompleted(true);
			navigate('/', { replace: true });
		} catch (error) {
			console.error('Error completing onboarding:', error);
			alert('Something went wrong while saving. Please try again.');
			setIsSaving(false);
		}
	};

	return (
		<main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-dark">
			<div className="mx-auto flex max-w-2xl flex-col gap-6">
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
						<img alt="" className="h-8 w-8" src={logo} />
						Got Crypto
					</span>
					<Button color="gray" disabled={isSaving} onClick={() => void finish(false)} size="xs">
						Skip setup
					</Button>
				</div>

				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Step {step + 1} of {STEPS.length}
					</p>
					<Progress
						aria-label={`Step ${step + 1} of ${STEPS.length}`}
						progress={((step + 1) / STEPS.length) * 100}
						size="sm"
					/>
				</div>

				<Card>
					<div className="flex flex-col gap-6">
						<header>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
							<p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
						</header>

						{step === 0 &&
							(isLoading ? (
								<div className="flex items-center justify-center gap-2 py-12 text-gray-500 dark:text-gray-400">
									<Spinner size="sm" />
									Loading coins from CoinMarketCap...
								</div>
							) : (
								<AssetSelector
									excludeIds={selectedCurrencies.map((asset) => asset.cmc_id)}
									onToggle={toggleCoin}
									options={fetchedCurrencies ?? []}
									selectedIds={selectedIds}
								/>
							))}

						{step === 1 && (
							<div className="flex flex-col gap-6">
								<PreferenceGroup description="Used for all prices" title="Currency">
									<SettingsPriceFormat />
								</PreferenceGroup>
								<PreferenceGroup description="How dates are shown" title="Date format">
									<SettingsDateFormat />
								</PreferenceGroup>
								<PreferenceGroup description="Light or dark theme" title="Appearance">
									<SettingsLightDarkMode />
								</PreferenceGroup>
							</div>
						)}

						{step === 2 && (
							<div className="flex flex-col gap-3">
								<p className="text-sm font-medium text-gray-900 dark:text-white">
									{chosenCoins.length} {chosenCoins.length === 1 ? 'coin' : 'coins'} on your
									dashboard
								</p>
								<ul className="flex flex-wrap gap-2">
									{chosenCoins.map((coin) => (
										<li
											className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
											key={coin.cmc_id}
										>
											<img alt="" className="h-6 w-6 rounded-full" src={getImage(coin.cmc_id)} />
											{coin.name}
										</li>
									))}
								</ul>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									You can change your coins and preferences any time in Settings.
								</p>
							</div>
						)}

						<footer className="flex items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
							{isFirstStep ? (
								<Button color="gray" onClick={() => void signOutUser()}>
									Sign out
								</Button>
							) : (
								<Button color="gray" disabled={isSaving} onClick={() => { setStep(step - 1); }}>
									<FaArrowLeft className="mr-2" />
									Back
								</Button>
							)}

							<div className="flex items-center gap-3">
								{isFirstStep && (
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{selectedIds.length === 0
											? 'Select at least one coin'
											: `${selectedIds.length} selected`}
									</span>
								)}
								{isLastStep ? (
									<Button color="primary" disabled={isSaving} onClick={() => void finish(true)}>
										{isSaving ? (
											<Spinner className="mr-2" size="sm" />
										) : (
											<FaCheck className="mr-2" />
										)}
										Go to dashboard
									</Button>
								) : (
									<Button
										color="primary"
										disabled={isFirstStep && selectedIds.length === 0}
										onClick={() => { setStep(step + 1); }}
									>
										Next
										<FaArrowRight className="ml-2" />
									</Button>
								)}
							</div>
						</footer>
					</div>
				</Card>
			</div>
		</main>
	);
}

export default OnboardingPage;
