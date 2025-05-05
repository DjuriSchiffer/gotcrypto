import { Button, Card, useThemeMode } from 'flowbite-react';
import Modal from './Modal';
import type { FetchedCurrency, SelectedAsset } from 'currency';
import { getImage } from '../utils/images';
import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

type DashboardModalsProps = {
	onCloseModals: () => void;
	onFormSubmit: (formData: any) => void;
	onRemoveAssets: (assetIds: number[]) => void;
	openAddAssetModal: boolean;
	options: Array<FetchedCurrency> | undefined;
	preselectedOptions: SelectedAsset[];
};

function DashboardModals({
	onCloseModals,
	onFormSubmit,
	onRemoveAssets,
	openAddAssetModal,
	options,
	preselectedOptions,
}: DashboardModalsProps) {
	const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
	const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
	const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');

	useEffect(() => {
		if (openAddAssetModal) {
			setSelectedAssets([]);
			setSelectedToRemove([]);
			setActiveTab('add');
		}
	}, [openAddAssetModal]);

	const handleTabChange = (tab: 'add' | 'manage') => {
		setActiveTab(tab);
	};

	const availableOptions = useMemo(() => {
		if (!options) return [];

		const existingIds = new Set(preselectedOptions.map((asset) => asset.cmc_id));

		return options.filter((option) => !existingIds.has(option.cmc_id));
	}, [options, preselectedOptions]);

	const existingAssets = useMemo(() => {
		if (!options) return [];

		const optionsMap = options.reduce((map, option) => {
			map.set(option.cmc_id, option);
			return map;
		}, new Map<number, FetchedCurrency>());

		const assetsWithTransactions = preselectedOptions
			.filter((asset) => asset.transactions.length > 0)
			.map((asset) => ({
				...asset,
				fetchedData: optionsMap.get(asset.cmc_id),
			}));

		return assetsWithTransactions;
	}, [options, preselectedOptions]);

	const removableAssets = useMemo(() => {
		if (!options) return [];

		const optionsMap = options.reduce((map, option) => {
			map.set(option.cmc_id, option);
			return map;
		}, new Map<number, FetchedCurrency>());

		const assetsWithoutTransactions = preselectedOptions
			.filter((asset) => asset.transactions.length === 0)
			.map((asset) => ({
				...asset,
				fetchedData: optionsMap.get(asset.cmc_id),
			}));

		return assetsWithoutTransactions;
	}, [options, preselectedOptions]);

	const toggleAssetSelection = (cmcId: number) => {
		if (activeTab === 'add') {
			setSelectedAssets((prevSelected) => {
				if (prevSelected.includes(cmcId)) {
					return prevSelected.filter((id) => id !== cmcId);
				} else {
					return [...prevSelected, cmcId];
				}
			});
		} else {
			setSelectedToRemove((prevSelected) => {
				if (prevSelected.includes(cmcId)) {
					return prevSelected.filter((id) => id !== cmcId);
				} else {
					return [...prevSelected, cmcId];
				}
			});
		}
	};

	const handleSubmit = () => {
		if (activeTab === 'add') {
			const assetsToAdd = selectedAssets.map((cmcId) => {
				const option = options?.find((opt) => opt.cmc_id === cmcId);

				return {
					cmc_id: cmcId,
					name: option?.name || '',
					transactions: [],
				};
			});

			onFormSubmit({
				selectedAssets: assetsToAdd,
			});
		} else {
			onRemoveAssets(selectedToRemove);
		}
	};

	return (
		<Modal onClose={onCloseModals} open={openAddAssetModal} title="Manage Dashboard Assets">
			<div className="mb-4">
				<div className="mb-4 flex border-b-2">
					<button
						className={`relative -bottom-0.5 px-4 py-2 font-medium ${
							activeTab === 'add'
								? 'border-b-2 border-green-500 text-green-500'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
						onClick={() => handleTabChange('add')}
					>
						Add Assets
					</button>
					<button
						className={`relative -bottom-0.5 px-4 py-2 font-medium ${
							activeTab === 'manage'
								? 'border-b-2 border-green-500 text-green-500'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
						onClick={() => handleTabChange('manage')}
					>
						Manage Assets
					</button>
				</div>
			</div>

			{activeTab === 'add' && (
				<>
					{availableOptions.length > 0 ? (
						<div className="mb-4 max-h-96 overflow-y-auto">
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{availableOptions.map((option) => (
									<Card
										key={option.cmc_id}
										onClick={() => toggleAssetSelection(option.cmc_id)}
										className={`cursor-pointer transition-colors ${
											selectedAssets.includes(option.cmc_id)
												? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
												: ''
										}`}
									>
										<div className="flex items-center space-x-2">
											<div className="shrink-0">
												<img
													alt={`${option.name} icon`}
													height={24}
													src={getImage(option.cmc_id)}
													width={24}
												/>
											</div>
											<div className="flex min-w-0 flex-1 items-center">
												<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
													{option.name}
												</h5>
											</div>
											{selectedAssets.includes(option.cmc_id) && (
												<div className="flex-shrink-0">
													<FaCheck className="text-green-500" />
												</div>
											)}
										</div>
									</Card>
								))}
							</div>
						</div>
					) : (
						<div className="mb-4 py-8 text-center">
							<p className="text-gray-500 dark:text-gray-400">No new assets available to add</p>
						</div>
					)}

					<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							{selectedAssets.length} asset(s) selected
						</div>
						<div className="flex flex-wrap gap-2">
							<Button color="primary" onClick={handleSubmit} disabled={selectedAssets.length === 0}>
								<FaPlus className="mr-2" /> Add Selected Assets
							</Button>
							<Button color="gray" onClick={onCloseModals}>
								Cancel
							</Button>
						</div>
					</div>
				</>
			)}

			{activeTab === 'manage' && (
				<>
					{existingAssets.length > 0 && (
						<div className="mb-4">
							<h5 className="mb-2 text-sm font-bold dark:text-white">
								Assets with transactions (cannot be removed):
							</h5>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{existingAssets.map((asset) => (
									<Card key={asset.cmc_id} className="bg-gray-50 dark:bg-gray-800">
										<div className="flex items-center space-x-2">
											<div className="shrink-0">
												<img
													alt={`${asset.name} icon`}
													height={24}
													src={getImage(asset.cmc_id)}
													width={24}
												/>
											</div>
											<div className="flex min-w-0 flex-1 items-center">
												<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
													{asset.name}
												</h5>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					)}

					{removableAssets.length > 0 && (
						<div className="mb-4 max-h-96 overflow-y-auto">
							<h5 className="mb-2 text-sm font-bold dark:text-white">
								Assets that can be removed:
							</h5>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{removableAssets.map((asset) => (
									<Card
										key={asset.cmc_id}
										onClick={() => toggleAssetSelection(asset.cmc_id)}
										className={`cursor-pointer transition-colors ${
											selectedToRemove.includes(asset.cmc_id)
												? 'border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
												: ''
										}`}
									>
										<div className="flex items-center space-x-2">
											<div className="shrink-0">
												<img
													alt={`${asset.name} icon`}
													height={24}
													src={getImage(asset.cmc_id)}
													width={24}
												/>
											</div>
											<div className="flex min-w-0 flex-1 items-center">
												<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
													{asset.name}
												</h5>
											</div>
											{selectedToRemove.includes(asset.cmc_id) && (
												<div className="flex-shrink-0">
													<FaTrash className="text-red-500" />
												</div>
											)}
										</div>
									</Card>
								))}
							</div>
						</div>
					)}

					<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							{selectedToRemove.length} asset(s) selected for removal
						</div>
						<div className="flex flex-wrap gap-2">
							<Button color="red" onClick={handleSubmit} disabled={selectedToRemove.length === 0}>
								<FaTrash className="mr-2" /> Remove Selected Assets
							</Button>
							<Button color="gray" onClick={onCloseModals}>
								Cancel
							</Button>
						</div>
					</div>
				</>
			)}
		</Modal>
	);
}

export default DashboardModals;
