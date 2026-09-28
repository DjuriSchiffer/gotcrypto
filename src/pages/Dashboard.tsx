import type { FetchedCurrency } from 'currency';

import { Button, Card } from 'flowbite-react';
import { useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import type { AssetChanges } from '../components/AssetManagerModal';
import type { FormInputs } from '../components/TransactionForm';

import AssetManagerModal from '../components/AssetManagerModal';
import { ChangeLayout } from '../components/ChangeLayout';
import AssetCard from '../components/dashboard/AssetCard';
import AssetTable from '../components/dashboard/AssetTable';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Modal from '../components/Modal';
import Page from '../components/Page';
import PortfolioStats from '../components/PortfolioStats';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { applyAssetChanges, getDashboardAssets } from '../utils/assets';
import { createCryptoMap } from '../utils/helpers';
import { getGlobalTotals } from '../utils/totals';
import { transactionFromForm, upsertTransaction } from '../utils/transactions';

function Dashboard() {
	const [assetManagerOpen, setAssetManagerOpen] = useState(false);
	const [addTransactionFor, setAddTransactionFor] = useState<FetchedCurrency | null>(null);

	const { currencyQuote, dashboardLayout, sortMethod } = useAppState();
	const { selectedCurrencies, setSelectedCurrencies, updateCurrency } = useStorage();
	const { data: fetchedCurrencies, isError, isLoading } = useCoinMarketCap(currencyQuote);

	/** Assets with transactions, by id */
	const assetMap = useMemo(() => createCryptoMap(selectedCurrencies), [selectedCurrencies]);

	const dashboardAssets = useMemo(
		() => getDashboardAssets(fetchedCurrencies, selectedCurrencies, sortMethod),
		[fetchedCurrencies, selectedCurrencies, sortMethod]
	);

	const totals = useMemo(
		() => getGlobalTotals(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);

	const openPositions = selectedCurrencies.filter((asset) => asset.totals.totalAmount > 0).length;

	const handleSaveAssets = async ({ addIds, removeIds }: AssetChanges) => {
		try {
			const toAdd = (fetchedCurrencies ?? []).filter((currency) =>
				addIds.includes(currency.cmc_id)
			);
			await setSelectedCurrencies(applyAssetChanges(selectedCurrencies, toAdd, removeIds));
			setAssetManagerOpen(false);
		} catch (error) {
			console.error('Failed to save assets:', error);
			alert('Failed to save your assets. Please try again.');
		}
	};

	const handleAddFirstTransaction = async (formData: FormInputs) => {
		if (!addTransactionFor) return;

		try {
			const asset = selectedCurrencies.find((item) => item.cmc_id === addTransactionFor.cmc_id);
			const updated = upsertTransaction(
				asset,
				addTransactionFor,
				transactionFromForm(formData),
				selectedCurrencies.length
			);

			await updateCurrency(updated);
			setAddTransactionFor(null);
		} catch (error) {
			console.error('Failed to add transaction:', error);
			alert('Failed to add transaction. Please try again.');
		}
	};

	const manageAssetsButton = (
		<Button color="primary" onClick={() => setAssetManagerOpen(true)}>
			<FaPlus className="mr-2" />
			Manage assets
		</Button>
	);

	return (
		<LoadingErrorWrapper fetchedIsLoading={isLoading} isError={isError}>
			<Page>
				<div className="mb-8 flex w-full flex-col gap-6">
					<PageHeader
						actions={
							<>
								{dashboardAssets.length > 0 && <ChangeLayout />}
								{manageAssetsButton}
							</>
						}
						description="Your assets at a glance"
						title="Dashboard"
					/>

					{assetMap.size > 0 && (
						<PortfolioStats
							currencyQuote={currencyQuote}
							openPositions={openPositions}
							totals={totals}
						/>
					)}

					{dashboardAssets.length === 0 && (
						<Card>
							<EmptyState
								action={manageAssetsButton}
								message="You haven't added any assets yet. Pick the coins you want to track to get started."
							/>
						</Card>
					)}

					{dashboardAssets.length > 0 && dashboardLayout === 'Grid' && (
						<section
							aria-label="Assets"
							className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
						>
							{dashboardAssets.map((currency) => (
								<AssetCard
									asset={assetMap.get(currency.cmc_id)}
									currencyQuote={currencyQuote}
									fetchedCurrency={currency}
									key={currency.cmc_id}
									onAddTransaction={() => setAddTransactionFor(currency)}
								/>
							))}
						</section>
					)}

					{dashboardAssets.length > 0 && dashboardLayout === 'Table' && (
						<AssetTable
							assetMap={assetMap}
							currencyQuote={currencyQuote}
							fetchedCurrencies={dashboardAssets}
							onAddTransaction={setAddTransactionFor}
						/>
					)}
				</div>

				<AssetManagerModal
					onClose={() => setAssetManagerOpen(false)}
					onSave={(changes) => void handleSaveAssets(changes)}
					open={assetManagerOpen}
					options={fetchedCurrencies}
					selectedAssets={selectedCurrencies}
				/>

				<Modal
					onClose={() => setAddTransactionFor(null)}
					open={addTransactionFor !== null}
					title={`Add your first ${addTransactionFor?.name ?? ''} transaction`}
				>
					<TransactionForm
						currencyQuote={currencyQuote}
						key={addTransactionFor?.cmc_id ?? 'closed'}
						onSubmit={(data) => void handleAddFirstTransaction(data)}
						submitLabel="Add Transaction"
					/>
				</Modal>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Dashboard;
