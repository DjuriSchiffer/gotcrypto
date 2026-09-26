import { Card, TabItem, Tabs } from 'flowbite-react';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaChartLine, FaList } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

import type { SelectedAsset, Transaction } from '../types/currency';

import DetailHeader from '../components/DetailHeader';
import DetailModals from '../components/DetailModals';
import DetailCharts from '../components/DetailsCharts';
import DetailTransactionTable from '../components/DetailTransactionTable';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';
import { cardTable } from '../theme';
import type { FormInputs } from '../components/TransactionForm';
import { transactionFromForm } from '../utils/transactions';
import { upsertTransaction } from '../utils/transactions';

import type { TabsRef } from 'flowbite-react';

const TRANSACTIONS_TAB = 0;
const CHARTS_TAB = 1;

function Detail() {
	const { currencyQuote } = useAppState();
	const {
		data: fetchedCurrencies,
		isError: fetchedCurrenciesIsError,
		isLoading: fetchedCurrenciesIsLoading,
	} = useCoinMarketCap(currencyQuote);
	const { loading: storageIsLoading, selectedCurrencies, updateCurrency } = useStorage();
	const { slug: currentAssetSlug } = useParams<{ slug: string }>();

	const [openAddTransactionModal, setOpenAddTransactionModal] = useState<boolean>(false);
	const [openEditTransactionModal, setOpenEditTransactionModal] = useState<boolean>(false);
	const [openRemoveTransactionModal, setOpenRemoveTransactionModal] = useState<boolean>(false);
	const [openRemoveAllTransactionsModal, setOpenRemoveAllTransactionsModal] =
		useState<boolean>(false);
	const [currentTransaction, setCurrentTransaction] = useState<null | Transaction>(null);
	const tabsRef = useRef<TabsRef>(null);
	const [activeTab, setActiveTab] = useState(TRANSACTIONS_TAB);

	const selectedAsset = useMemo(() => {
		return selectedCurrencies.find((currency) => currency.slug === currentAssetSlug);
	}, [selectedCurrencies, currentAssetSlug]);

	const hasTransactions = (selectedAsset?.transactions.length ?? 0) > 0;

	const currentFetchedCurrency = useMemo(() => {
		return fetchedCurrencies?.find((element) => element.slug === currentAssetSlug);
	}, [fetchedCurrencies, currentAssetSlug]);

	useEffect(() => {
		if (!hasTransactions) {
			tabsRef.current?.setActiveTab(TRANSACTIONS_TAB);
			setActiveTab(TRANSACTIONS_TAB);
		}
	}, [hasTransactions]);

	const handleOpenAddTransactionModal = () => {
		setCurrentTransaction(null);
		setOpenAddTransactionModal(true);
	};

	const handleOpenEditTransactionModal = (transaction: Transaction) => {
		setCurrentTransaction(transaction);
		setOpenEditTransactionModal(true);
	};

	const handleOpenRemoveTransactionModal = (transaction: Transaction) => {
		setCurrentTransaction(transaction);
		setOpenRemoveTransactionModal(true);
	};

	const handleOpenRemoveAllTransactionsModal = () => {
		setOpenRemoveAllTransactionsModal(true);
	};

	const handleCloseModals = () => {
		setOpenAddTransactionModal(false);
		setOpenEditTransactionModal(false);
		setOpenRemoveTransactionModal(false);
		setOpenRemoveAllTransactionsModal(false);
		setCurrentTransaction(null);
	};

	const handleFormSubmit = async (formData: FormInputs) => {
		if (!currentFetchedCurrency) return;

		try {
			const transaction = transactionFromForm(formData, currentTransaction?.id);
			const updated = upsertTransaction(
				selectedAsset,
				currentFetchedCurrency,
				transaction,
				selectedCurrencies.length
			);

			await updateCurrency(updated);
			handleCloseModals();
		} catch (error) {
			console.error('Failed to update transaction:', error);
			alert('Failed to update transaction. Please try again.');
		}
	};

	const handleRemoveTransaction = async () => {
		if (!selectedAsset || !currentTransaction) return;

		try {
			const updatedTransactions = selectedAsset.transactions.filter(
				(transaction) => transaction.id !== currentTransaction.id
			);

			const updatedSelectedCurrency: SelectedAsset = {
				...selectedAsset,
				totals: totals(updatedTransactions),
				transactions: updatedTransactions,
			};

			await updateCurrency(updatedSelectedCurrency);
			handleCloseModals();
		} catch (error) {
			console.error('Failed to remove transaction:', error);
			alert('Failed to remove transaction. Please try again.');
		}
	};

	const handleRemoveAllTransactions = async () => {
		if (!selectedAsset) return;

		try {
			const updatedSelectedCurrency: SelectedAsset = {
				...selectedAsset,
				totals: totals([]),
				transactions: [],
			};

			await updateCurrency(updatedSelectedCurrency);
			handleCloseModals();
		} catch (error) {
			console.error('Failed to remove all transactions:', error);
			alert('Failed to remove all transactions. Please try again.');
		}
	};

	const handleAddTransactionClick = () => {
		handleOpenAddTransactionModal();
	};

	const handleRemoveAllTransactionsClick = () => {
		handleOpenRemoveAllTransactionsModal();
	};

	const handleRemoveAllTransactionsCallback = () => {
		void handleRemoveAllTransactions();
	};

	const handleFormSubmitCallback = (formData: FormInputs) => {
		void handleFormSubmit(formData);
	};

	const handleRemoveTransactionCallback = () => {
		void handleRemoveTransaction();
	};

	if (!currentFetchedCurrency) {
		return (
			<LoadingErrorWrapper
				fetchedIsLoading={fetchedCurrenciesIsLoading}
				isError={fetchedCurrenciesIsError}
			>
				<Page>
					<div className="flex h-screen flex-col items-center justify-center text-dark dark:text-white">
						<p className="mb-4">We couldn't find this asset.</p>
						<Link
							className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-3 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							to="/"
						>
							<FaArrowLeft className="mr-2" />
							Return to dashboard
						</Link>
					</div>
				</Page>
			</LoadingErrorWrapper>
		);
	}

	return (
		<LoadingErrorWrapper
			fetchedIsLoading={fetchedCurrenciesIsLoading}
			isError={fetchedCurrenciesIsError}
		>
			<Page>
				<div className="mb-4 grid w-full gap-4 lg:mt-auto">
					<div className="mb-4 grid grid-cols-1 gap-4">
						<DetailHeader
							currencyQuote={currencyQuote}
							currentFetchedCurrency={currentFetchedCurrency}
							onAddTransaction={handleAddTransactionClick}
							onRemoveAllTransactions={handleRemoveAllTransactionsClick}
							selectedAsset={selectedAsset}
						/>
						<Tabs
							aria-label="Transactions and charts"
							onActiveTabChange={setActiveTab}
							ref={tabsRef}
							variant="underline"
						>
							<TabItem active icon={FaList} title="Transactions">
								<Card theme={cardTable.card}>
									<DetailTransactionTable
										currencyQuote={currencyQuote}
										currentFetchedCurrency={currentFetchedCurrency}
										fetchedCurrencies={fetchedCurrencies ?? []}
										onEditTransaction={handleOpenEditTransactionModal}
										onRemoveTransaction={handleOpenRemoveTransactionModal}
										selectedAsset={selectedAsset}
									/>
								</Card>
							</TabItem>

							<TabItem disabled={!hasTransactions} icon={FaChartLine} title="Charts">
								{activeTab === CHARTS_TAB && selectedAsset && (
									<Card>
										<DetailCharts currencyQuote={currencyQuote} selectedAsset={selectedAsset} />
									</Card>
								)}
							</TabItem>
						</Tabs>
					</div>

					<DetailModals
						currencyQuote={currencyQuote}
						currentTransaction={currentTransaction}
						onCloseModals={handleCloseModals}
						onFormSubmit={handleFormSubmitCallback}
						onRemoveAllTransactions={handleRemoveAllTransactionsCallback}
						onRemoveTransaction={handleRemoveTransactionCallback}
						openAddTransactionModal={openAddTransactionModal}
						openEditTransactionModal={openEditTransactionModal}
						openRemoveAllTransactionsModal={openRemoveAllTransactionsModal}
						openRemoveTransactionModal={openRemoveTransactionModal}
						selectedAssetName={selectedAsset?.name}
					/>
				</div>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Detail;
