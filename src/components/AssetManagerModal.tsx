import { Button, Card } from 'flowbite-react';
import Modal from './Modal';
import type { FetchedCurrency, SelectedAsset } from 'currency';
import { getImage } from '../utils/images';
import { useState, useEffect, useMemo } from 'react';
import { FaSave, FaCheck, FaLock } from 'react-icons/fa';

type AssetManagerModalProps = {
	onCloseModals: () => void;
	onFormSubmit: (formData: any) => void;
	onRemoveAssets: (assetIds: number[]) => void;
	openAddAssetModal: boolean;
	options: Array<FetchedCurrency> | undefined;
	preselectedOptions: SelectedAsset[];
};

function AssetManagerModal({
	onCloseModals,
	onFormSubmit,
	onRemoveAssets,
	openAddAssetModal,
	options,
	preselectedOptions,
}: AssetManagerModalProps) {
	const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

	const assetsWithTransactions = useMemo(() => {
		return new Set(
			preselectedOptions
				.filter((asset) => asset.transactions.length > 0)
				.map((asset) => asset.cmc_id)
		);
	}, [preselectedOptions]);

	useEffect(() => {
		if (openAddAssetModal) {
			const currentlySelectedIds = preselectedOptions.map((asset) => asset.cmc_id);
			setSelectedAssets(currentlySelectedIds);
		}
	}, [openAddAssetModal, preselectedOptions]);

	const toggleAssetSelection = (cmcId: number) => {
		if (assetsWithTransactions.has(cmcId)) {
			return;
		}

		setSelectedAssets((prevSelected) => {
			if (prevSelected.includes(cmcId)) {
				return prevSelected.filter((id) => id !== cmcId);
			} else {
				return [...prevSelected, cmcId];
			}
		});
	};

	const handleSubmit = () => {
		const currentIds = new Set(preselectedOptions.map((asset) => asset.cmc_id));

		const idsToAdd = selectedAssets.filter((id) => !currentIds.has(id));

		const assetsToAdd = idsToAdd.map((cmcId) => {
			const option = options?.find((opt) => opt.cmc_id === cmcId);
			return {
				cmc_id: cmcId,
				name: option?.name || '',
				transactions: [],
			};
		});

		const idsToRemove = Array.from(currentIds).filter(
			(id) => !assetsWithTransactions.has(id) && !selectedAssets.includes(id)
		);

		if (assetsToAdd.length > 0) {
			onFormSubmit({
				selectedAssets: assetsToAdd,
			});
		}

		if (idsToRemove.length > 0) {
			onRemoveAssets(idsToRemove);
		}

		if (assetsToAdd.length === 0 && idsToRemove.length === 0) {
			onCloseModals();
		}
	};

	const calculateStats = () => {
		const currentIds = new Set(preselectedOptions.map((asset) => asset.cmc_id));

		const newAssets = selectedAssets.filter((id) => !currentIds.has(id)).length;

		const removedAssets = Array.from(currentIds).filter(
			(id) => !assetsWithTransactions.has(id) && !selectedAssets.includes(id)
		).length;

		return {
			newAssets,
			removedAssets,
			totalSelected: selectedAssets.length,
		};
	};

	const stats = calculateStats();
	const hasChanges = stats.newAssets > 0 || stats.removedAssets > 0;

	return (
		<Modal onClose={onCloseModals} open={openAddAssetModal} title="Manage Assets" size="3xl">
			<div>
				<p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
					Select or deselect assets to customize your dashboard. Assets with transactions cannot be
					removed.
				</p>

				{options && (
					<div className="mb-4 grid max-h-96 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
						{options.map((asset) => {
							const isSelected = selectedAssets.includes(asset.cmc_id);
							const hasTransactions = assetsWithTransactions.has(asset.cmc_id);
							const isCurrentlyInDashboard = preselectedOptions.some(
								(item) => item.cmc_id === asset.cmc_id
							);

							return (
								<Card
									key={asset.cmc_id}
									onClick={() => toggleAssetSelection(asset.cmc_id)}
									className={`transition-colors ${
										hasTransactions
											? 'cursor-not-allowed bg-slate-100 dark:bg-slate-700'
											: 'cursor-pointer'
									} ${
										isSelected
											? hasTransactions
												? 'border-slate-400'
												: 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
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
										<div className="min-w-0 flex-1">
											<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
												{asset.name}
											</h5>
											{isCurrentlyInDashboard && (
												<span className="text-xs text-gray-500 dark:text-gray-400">
													In dashboard
												</span>
											)}
										</div>
										{hasTransactions && (
											<div className="flex-shrink-0 text-gray-500">
												<FaLock size={12} title="Has transactions" />
											</div>
										)}
										{isSelected && (
											<div className="flex-shrink-0">
												<FaCheck className="text-green-500" />
											</div>
										)}
									</div>
								</Card>
							);
						})}
					</div>
				)}

				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{stats.totalSelected} asset(s) selected
						{stats.newAssets > 0 && (
							<span className="ml-2 text-green-500">+{stats.newAssets} new</span>
						)}
						{stats.removedAssets > 0 && (
							<span className="ml-2 text-red-500">-{stats.removedAssets} removed</span>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button color="primary" onClick={handleSubmit} disabled={!hasChanges}>
							<FaSave className="mr-2" /> Save Changes
						</Button>
						<Button color="gray" onClick={onCloseModals}>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default AssetManagerModal;
