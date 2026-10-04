import type { TabsRef } from 'flowbite-react';

import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Card,
	Dropdown,
	DropdownItem,
	TabItem,
	Tabs,
} from 'flowbite-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	FaArrowLeft,
	FaChartLine,
	FaChartPie,
	FaEllipsisH,
	FaList,
	FaPlus,
	FaTrashAlt,
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

import type { FormInputs } from '../components/TransactionForm';
import type { Transaction } from '../types/currency';

import DetailCharts from '../components/detail/DetailCharts';
import DetailModals from '../components/detail/DetailModals';
import PositionStats from '../components/detail/PositionStats';
import TransactionTable from '../components/detail/TransactionTable';
import Page from '../components/layout/Page';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getAssetSummary } from '../utils/totals';
import {
	clearTransactions,
	removeTransaction,
	transactionFromForm,
	upsertTransaction,
} from '../utils/transactions';

/** Which dialog is open. Only one can be open at a time. */
type Dialog =
	| null
	| { transaction: Transaction; type: 'edit' }
	| { transaction: Transaction; type: 'remove' }
	| { type: 'add' }
	| { type: 'removeAll' };

const TRANSACTIONS_TAB = 0;
const CHARTS_TAB = 1;

function Detail() {
	const { slug } = useParams<{ slug: string }>();
	const { currencyQuote } = useAppState();
	const { selectedCurrencies, updateCurrency } = useStorage();
	const { data: fetchedCurrencies, isError, isLoading } = useCoinMarketCap(currencyQuote);

	const [dialog, setDialog] = useState<Dialog>(null);
	const [activeTab, setActiveTab] = useState(TRANSACTIONS_TAB);
	const tabsRef = useRef<TabsRef>(null);

	const currency = useMemo(
		() => fetchedCurrencies?.find((item) => item.slug === slug),
		[fetchedCurrencies, slug]
	);

	// By id, not slug: assets created by the old asset picker have no slug
	const asset = useMemo(
		() => selectedCurrencies.find((item) => item.cmc_id === currency?.cmc_id),
		[selectedCurrencies, currency]
	);

	const transactions = asset?.transactions ?? [];
	const hasTransactions = transactions.length > 0;
	const summary = getAssetSummary(asset, currency?.price ?? 0);

	// If the last transaction is removed while the charts tab is open, go back to the table
	useEffect(() => {
		if (!hasTransactions) {
			tabsRef.current?.setActiveTab(TRANSACTIONS_TAB);
			setActiveTab(TRANSACTIONS_TAB);
		}
	}, [hasTransactions]);

	const closeDialog = () => { setDialog(null); };

	/** Saves the asset; shows an alert and keeps the dialog open if that fails. */
	const save = async (update: () => Parameters<typeof updateCurrency>[0]) => {
		try {
			await updateCurrency(update());
			closeDialog();
		} catch (error) {
			console.error('Failed to save transactions:', error);
			alert('Failed to save your changes. Please try again.');
		}
	};

	if (!currency) {
		return (
			<LoadingErrorWrapper fetchedIsLoading={isLoading} isError={isError}>
				<Page>
					<Card>
						<EmptyState
							action={
								<Button as={Link} color="primary" to="/">
									<FaArrowLeft className="mr-2" />
									Back to dashboard
								</Button>
							}
							message="We couldn't find this asset."
						/>
					</Card>
				</Page>
			</LoadingErrorWrapper>
		);
	}

	const editingTransaction =
		dialog?.type === 'edit' || dialog?.type === 'remove' ? dialog.transaction : null;

	const handleSubmit = (formData: FormInputs) =>
		void save(() =>
			upsertTransaction(
				asset,
				currency,
				transactionFromForm(formData, dialog?.type === 'edit' ? dialog.transaction.id : undefined),
				selectedCurrencies.length
			)
		);

	const handleRemove = () => {
		if (asset && dialog?.type === 'remove') {
			void save(() => removeTransaction(asset, dialog.transaction.id));
		}
	};

	const handleRemoveAll = () => {
		if (asset) {
			void save(() => clearTransactions(asset));
		}
	};

	const addButton = (
		<Button color="primary" onClick={() => { setDialog({ type: 'add' }); }}>
			<FaPlus className="mr-2" />
			Add transaction
		</Button>
	);

	return (
		<LoadingErrorWrapper fetchedIsLoading={isLoading} isError={isError}>
			<Page>
				<div className="mb-8 flex w-full flex-col gap-6">
					<div className="flex flex-col gap-3">
						{/* flowbite's BreadcrumbItem href would be a plain <a> and reload the app,
						    so the router Link goes inside the item instead */}
						<Breadcrumb aria-label="Breadcrumb">
							<BreadcrumbItem icon={FaChartPie}>
								<Link className="hover:text-gray-900 dark:hover:text-white" to="/">
									Dashboard
								</Link>
							</BreadcrumbItem>
							<BreadcrumbItem>{currency.name}</BreadcrumbItem>
						</Breadcrumb>
						<PageHeader
							actions={
								<>
									{addButton}
									{hasTransactions && (
										<Dropdown
											arrowIcon={false}
											color="gray"
											label={<FaEllipsisH aria-label="More actions" />}
											placement="bottom-end"
										>
											<DropdownItem
												icon={FaTrashAlt}
												onClick={() => { setDialog({ type: 'removeAll' }); }}
											>
												Remove all transactions
											</DropdownItem>
										</Dropdown>
									)}
								</>
							}
							description={`${currencyFormat(currency.price, currencyQuote)} current price`}
							icon={
								<img
									alt=""
									className="h-12 w-12 rounded-full"
									height={48}
									src={getImage(currency.cmc_id, 64)}
									width={48}
								/>
							}
							title={currency.name}
						/>
					</div>

					{hasTransactions && <PositionStats currencyQuote={currencyQuote} summary={summary} />}

					<Tabs
						aria-label="Transactions and charts"
						onActiveTabChange={setActiveTab}
						ref={tabsRef}
						variant="underline"
					>
						<TabItem active icon={FaList} title="Transactions">
							<SectionCard
								description={
									hasTransactions
										? `${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'}`
										: undefined
								}
								flush={hasTransactions}
								title="Transactions"
							>
								{hasTransactions ? (
									<TransactionTable
										currencyQuote={currencyQuote}
										currentPrice={currency.price}
										onEdit={(transaction) => { setDialog({ transaction, type: 'edit' }); }}
										onRemove={(transaction) => { setDialog({ transaction, type: 'remove' }); }}
										transactions={transactions}
									/>
								) : (
									<EmptyState
										action={addButton}
										message={`Add your first ${currency.name} transaction to start tracking this asset.`}
									/>
								)}
							</SectionCard>
						</TabItem>

						<TabItem disabled={!hasTransactions} icon={FaChartLine} title="Charts">
							{/* Render only when visible: ApexCharts can't size itself inside a hidden tab */}
							{activeTab === CHARTS_TAB && hasTransactions && (
								<DetailCharts
									currencyQuote={currencyQuote}
									currentPrice={currency.price}
									transactions={transactions}
								/>
							)}
						</TabItem>
					</Tabs>
				</div>

				<DetailModals
					currencyQuote={currencyQuote}
					currentTransaction={editingTransaction}
					onCloseModals={closeDialog}
					onFormSubmit={handleSubmit}
					onRemoveAllTransactions={handleRemoveAll}
					onRemoveTransaction={handleRemove}
					openAddTransactionModal={dialog?.type === 'add'}
					openEditTransactionModal={dialog?.type === 'edit'}
					openRemoveAllTransactionsModal={dialog?.type === 'removeAll'}
					openRemoveTransactionModal={dialog?.type === 'remove'}
					selectedAssetName={currency.name}
					transactionCount={transactions.length}
				/>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Detail;
