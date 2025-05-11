import { useState } from 'react';
import { Button, Progress, Card, Spinner } from 'flowbite-react';
import { useStorage } from '../hooks/useStorage';
import { useAssetSelection } from '../hooks/useAssetSelection';
import AssetSelector from '../components/AssetSelector';
import SettingsPriceFormat from '../components/SettingsPriceFormat';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsLightDarkMode from '../components/SettingsLightDarkMode';
import type { SelectedAsset } from 'currency';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

interface OnboardingStep {
	title: string;
	description: string;
	component: React.ReactNode;
}

function OnboardingPage() {
	const [currentStep, setCurrentStep] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [pendingAssets, setPendingAssets] = useState<
		Array<{ cmc_id: number; name: string; transactions: any[] }>
	>([]);

	const { currencyQuote, selectedCurrencies, setSelectedCurrencies, setOnboardingCompleted } =
		useStorage();

	const { selectedAssets, toggleAssetSelection } = useAssetSelection();

	const { data: fetchedCurrencies, isLoading: fetchedCurrenciesIsLoading } =
		useCoinMarketCap(currencyQuote);

	const steps: OnboardingStep[] = [
		{
			title: 'Select Your Assets',
			description: 'Choose the assets you want to monitor in your portfolio',
			component: (
				<>
					{fetchedCurrenciesIsLoading ? (
						<div className="py-8 text-center">
							<Spinner aria-label="Loading" color="green" />
							<span className="ml-2">Fetching data from CoinMarketCap...</span>
						</div>
					) : (
						<>
							<AssetSelector
								options={fetchedCurrencies}
								preselectedOptions={selectedCurrencies}
								selectedAssets={selectedAssets}
								onToggleAsset={toggleAssetSelection}
							/>
							<div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
								{selectedAssets.length} asset(s) selected
							</div>
						</>
					)}
				</>
			),
		},
		{
			title: 'Currency Preference',
			description: 'Select the currency to display values in your portfolio',
			component: <SettingsPriceFormat />,
		},
		{
			title: 'Date & Time Format',
			description: 'Select how dates should be displayed',
			component: <SettingsDateFormat />,
		},
		{
			title: 'Theme Preference',
			description: 'Choose either a light or a dark themed app',
			component: <SettingsLightDarkMode />,
		},
		{
			title: "You're all set!",
			description: 'Click Save to start tracking your portfolio',
			component: null,
		},
	];

	const handleNext = async () => {
		if (currentStep === 0 && selectedAssets.length > 0) {
			const assetsToAdd = selectedAssets.map((cmcId) => {
				const option = fetchedCurrencies?.find((opt) => opt.cmc_id === cmcId);
				return {
					cmc_id: cmcId,
					name: option?.name || '',
					transactions: [],
				};
			});
			setPendingAssets(assetsToAdd);
		}

		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			await handleComplete();
		}
	};

	const handleBack = () => {
		if (currentStep === 0) {
			handleSignOut();
		}
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSkip = async () => {
		await setOnboardingCompleted(true);
		window.location.href = '/';
	};

	const handleComplete = async () => {
		setIsProcessing(true);
		try {
			if (pendingAssets.length > 0) {
				const existingIds = new Set(selectedCurrencies.map((currency) => currency.cmc_id));
				const newAssets = pendingAssets.filter((asset) => !existingIds.has(asset.cmc_id));

				if (newAssets.length > 0) {
					const updatedCurrencies = [
						...selectedCurrencies,
						...(newAssets as unknown as SelectedAsset[]),
					];
					await setSelectedCurrencies(updatedCurrencies);
				}
			}

			await setOnboardingCompleted(true);
			window.location.href = '/';
		} catch (error) {
			console.error('Error completing onboarding:', error);
			setIsProcessing(false);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			console.log('User signed out');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const progressSteps = steps.length - 1;
	const progress = (currentStep / progressSteps) * 100;
	const currentStepData = steps[currentStep];

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-dark">
			<div className="mb-10">
				<Progress size="md" progress={progress} color="green" />
			</div>
			<div className="flex h-[calc(100vh-72px)] flex-col items-center px-4">
				<div className="flex h-full w-full max-w-2xl flex-col">
					<div className="p-4 text-center">
						<h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
							{currentStepData.title}
							<p className="text-lg text-gray-600 dark:text-white">{currentStepData.description}</p>
						</h1>
					</div>
					{currentStepData.component && <Card className="mb-4">{currentStepData.component}</Card>}

					<div className="mt-auto flex gap-4">
						<Button color="gray" onClick={handleBack} className="flex-1">
							Back
						</Button>
						<Button
							color="primary"
							onClick={handleNext}
							disabled={isProcessing || (currentStep === 0 && selectedAssets.length === 0)}
							className="flex-1"
						>
							{isProcessing ? 'Processing...' : currentStep === steps.length - 1 ? 'Save' : 'Next'}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}

export default OnboardingPage;
