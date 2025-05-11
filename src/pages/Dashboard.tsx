import { SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, Card, Tooltip } from 'flowbite-react';
import { useMemo, useState } from 'react';

import { ChangeLayout } from '../components/ChangeLayout';
import DashboardCard from '../components/DashboardCard';
import DashboardTableRow from '../components/DashboardTableRow';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import Table from '../components/Table';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { createCryptoMap, currencyFormat, percentageFormat } from '../utils/helpers';
import { getGlobalTotals } from '../utils/totals';
import { cardTable } from '../theme';
import DashboardModals from '../components/DashboardModals';
import { FaPlus } from 'react-icons/fa';

function Dashboard() {
	const [openAddAssetModal, setOpenAddAssetModal] = useState<boolean>(false);

	const { currencyQuote, dashboardLayout, sortMethod } = useAppState();
	const { loading: storageIsLoading, selectedCurrencies, setSelectedCurrencies } = useStorage();
	const {
		data: fetchedCurrencies,
		isError: fetchedCurrenciesIsError,
		isLoading: fetchedCurrenciesIsLoading,
	} = useCoinMarketCap(currencyQuote);

	const assetMap = useMemo(() => createCryptoMap(selectedCurrencies), [selectedCurrencies]);

	const filteredFetchedCurrencies = useMemo(() => {
		if (!fetchedCurrencies) return [];
		const savedIds = new Set(selectedCurrencies.map((currency) => currency.cmc_id));
		return fetchedCurrencies.filter((currency) => savedIds.has(currency.cmc_id));
	}, [fetchedCurrencies, selectedCurrencies]);

	const sortedFetchedCurrencies = useMemo(() => {
		if (!filteredFetchedCurrencies) {
			return [];
		}
		const sorted = [...filteredFetchedCurrencies];

		if (sortMethod === 'cmc_rank') {
			sorted.sort((a, b) => {
				if (a.cmc_rank !== null && b.cmc_rank !== null) {
					return a.cmc_rank - b.cmc_rank;
				} else if (a.cmc_rank !== null && b.cmc_rank === null) {
					return -1;
				} else if (a.cmc_rank === null && b.cmc_rank !== null) {
					return 1;
				} else {
					return 0;
				}
			});
		} else {
			sorted.sort((a, b) => {
				const aSelected = assetMap.has(a.cmc_id) ? 0 : 1;
				const bSelected = assetMap.has(b.cmc_id) ? 0 : 1;

				if (aSelected !== bSelected) {
					return aSelected - bSelected;
				}

				if (a.cmc_rank !== null && b.cmc_rank !== null) {
					return a.cmc_rank - b.cmc_rank;
				} else if (a.cmc_rank !== null && b.cmc_rank === null) {
					return -1;
				} else if (a.cmc_rank === null && b.cmc_rank !== null) {
					return 1;
				} else {
					return 0;
				}
			});
		}

		return sorted;
	}, [sortMethod, assetMap, filteredFetchedCurrencies]);

	const globalTotals = useMemo(() => {
		return getGlobalTotals(selectedCurrencies, fetchedCurrencies);
	}, [fetchedCurrencies, selectedCurrencies]);

	const handleFormSubmit = async ({ selectedAssets }: { selectedAssets: SelectedAsset[] }) => {
		try {
			if (!selectedAssets || selectedAssets.length === 0) {
				return;
			}

			const existingIds = new Set(selectedCurrencies.map((currency) => currency.cmc_id));

			const newAssets = selectedAssets.filter((asset) => !existingIds.has(asset.cmc_id));

			if (newAssets.length === 0) {
				return;
			}

			const updatedCurrencies = [...selectedCurrencies, ...newAssets];

			await setSelectedCurrencies(updatedCurrencies);

			handleCloseModals();
		} catch (error) {
			console.error('Failed to add assets:', error);
			alert('Failed to add assets. Please try again.');
		}
	};

	const handleRemoveAssets = async (assetIds: number[]) => {
		try {
			if (!assetIds || assetIds.length === 0) {
				return;
			}

			const updatedCurrencies = selectedCurrencies.filter(
				(currency) => !assetIds.includes(currency.cmc_id)
			);

			await setSelectedCurrencies(updatedCurrencies);

			handleCloseModals();
		} catch (error) {
			console.error('Failed to remove assets:', error);
			alert('Failed to remove assets. Please try again.');
		}
	};

	const handleCloseModals = () => {
		setOpenAddAssetModal(false);
	};

	const handleOpenAddAssetModal = () => {
		setOpenAddAssetModal(true);
	};

	return (
		<LoadingErrorWrapper
			fetchedIsLoading={fetchedCurrenciesIsLoading}
			isError={fetchedCurrenciesIsError}
			storageIsLoading={storageIsLoading}
		>
			<Page>
				<div className="mb-4 grid w-full gap-4">
					<div className="mb-4 flex flex-col flex-wrap lg:flex-row lg:items-center lg:justify-between">
						<div className="mb-4 text-gray-900 dark:text-white md:mb-0">
							Current balance
							<Tooltip content="Total Value">
								<div className="text-4xl">
									{currencyFormat(globalTotals.totalValue, currencyQuote)}
								</div>
							</Tooltip>
							<Tooltip content="((Total Value - Total Invested) / Total Invested) × 100">
								<div
									className={classNames('text-xl', {
										'text-green-500': globalTotals.totalPercentageDifference > 0,
										'text-red-500': globalTotals.totalPercentageDifference < 0,
									})}
								>
									{percentageFormat(globalTotals.totalPercentageDifference)}
								</div>
							</Tooltip>
						</div>

						<div className="flex flex-wrap gap-2 space-x-2">
							{sortedFetchedCurrencies.length > 0 && <ChangeLayout />}
							<Button color="primary" className="!mx-0" onClick={handleOpenAddAssetModal}>
								<FaPlus className="mr-1" color="white" />
								Manage Dashboard
							</Button>
						</div>
					</div>
					{sortedFetchedCurrencies.length === 0 && (
						<Card>
							<div className="flex h-40 items-center justify-center text-dark dark:text-white">
								<span>No assets added yet.</span>
							</div>
						</Card>
					)}

					{dashboardLayout === 'Grid' && sortedFetchedCurrencies.length > 0 && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{sortedFetchedCurrencies.map((fetchedCurrency) => {
								const asset = assetMap.get(fetchedCurrency.cmc_id);
								const hasTransactions =
									assetMap.has(fetchedCurrency.cmc_id) &&
									asset !== undefined &&
									asset.transactions.length > 0;
								return (
									<DashboardCard
										assetMap={assetMap}
										currencyQuote={currencyQuote}
										fetchedCurrency={fetchedCurrency}
										hasTransactions={hasTransactions}
										key={fetchedCurrency.cmc_id}
									/>
								);
							})}
						</div>
					)}
					{dashboardLayout === 'Table' && sortedFetchedCurrencies.length > 0 && (
						<Card theme={cardTable.card}>
							<Table type="dashboard">
								{sortedFetchedCurrencies.map((fetchedCurrency) => {
									const asset = assetMap.get(fetchedCurrency.cmc_id);
									const hasTransactions =
										assetMap.has(fetchedCurrency.cmc_id) &&
										asset !== undefined &&
										asset.transactions.length > 0;
									return (
										<DashboardTableRow
											assetMap={assetMap}
											currencyQuote={currencyQuote}
											fetchedCurrency={fetchedCurrency}
											hasTransactions={hasTransactions}
											key={fetchedCurrency.cmc_id}
										/>
									);
								})}
							</Table>
						</Card>
					)}
					<DashboardModals
						onCloseModals={handleCloseModals}
						onFormSubmit={handleFormSubmit}
						onRemoveAssets={handleRemoveAssets}
						openAddAssetModal={openAddAssetModal}
						options={fetchedCurrencies}
						preselectedOptions={selectedCurrencies}
					/>
				</div>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Dashboard;
