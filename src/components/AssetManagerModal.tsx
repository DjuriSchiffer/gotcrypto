import type { FetchedCurrency, SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, Card } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { FaCheck, FaLock, FaSave } from 'react-icons/fa';

import { getImage } from '../utils/images';
import Modal from './Modal';

export type AssetChanges = {
	addIds: Array<number>;
	removeIds: Array<number>;
};

type AssetManagerModalProps = {
	onClose: () => void;
	/** Called once with every addition and removal, so one save can't overwrite the other */
	onSave: (changes: AssetChanges) => void;
	open: boolean;
	options: Array<FetchedCurrency> | undefined;
	selectedAssets: Array<SelectedAsset>;
};

function AssetManagerModal({
	onClose,
	onSave,
	open,
	options,
	selectedAssets,
}: AssetManagerModalProps) {
	const [selectedIds, setSelectedIds] = useState<Array<number>>([]);

	const currentIds = useMemo(
		() => new Set(selectedAssets.map((asset) => asset.cmc_id)),
		[selectedAssets]
	);

	const lockedIds = useMemo(
		() =>
			new Set(
				selectedAssets.filter((asset) => asset.transactions.length > 0).map((asset) => asset.cmc_id)
			),
		[selectedAssets]
	);

	// Start from the current selection every time the modal opens
	useEffect(() => {
		if (open) {
			setSelectedIds(selectedAssets.map((asset) => asset.cmc_id));
		}
	}, [open, selectedAssets]);

	const toggle = (cmcId: number) => {
		if (lockedIds.has(cmcId)) return;

		setSelectedIds((previous) =>
			previous.includes(cmcId) ? previous.filter((id) => id !== cmcId) : [...previous, cmcId]
		);
	};

	const addIds = selectedIds.filter((id) => !currentIds.has(id));
	const removeIds = [...currentIds].filter((id) => !lockedIds.has(id) && !selectedIds.includes(id));
	const hasChanges = addIds.length > 0 || removeIds.length > 0;

	return (
		<Modal onClose={onClose} open={open} size="3xl" title="Manage assets">
			<p className="text-sm text-gray-500 dark:text-gray-400">
				Choose the coins to show on your dashboard. Coins with transactions can't be removed.
			</p>

			{options && (
				<div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
					{options.map((option) => {
						const isSelected = selectedIds.includes(option.cmc_id);
						const isLocked = lockedIds.has(option.cmc_id);

						return (
							<Card
								aria-disabled={isLocked}
								aria-pressed={isSelected}
								className={classNames('transition-colors', {
									'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-90':
										isSelected && !isLocked,
									'cursor-not-allowed bg-gray-100 dark:bg-gray-700': isLocked,
									'cursor-pointer': !isLocked,
								})}
								key={option.cmc_id}
								onClick={() => { toggle(option.cmc_id); }}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										toggle(option.cmc_id);
									}
								}}
								role="button"
								tabIndex={isLocked ? -1 : 0}
							>
								<div className="flex items-center gap-2">
									<img alt="" height={24} src={getImage(option.cmc_id)} width={24} />
									<span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
										{option.name}
									</span>
									{isLocked && (
										<FaLock aria-label="Has transactions" className="text-gray-400" size={12} />
									)}
									{isSelected && !isLocked && (
										<FaCheck aria-hidden className="text-primary-700 dark:text-primary-400" />
									)}
								</div>
							</Card>
						);
					})}
				</div>
			)}

			<div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{selectedIds.length} selected
					{addIds.length > 0 && <span className="ml-2 text-primary-400">+{addIds.length} new</span>}
					{removeIds.length > 0 && (
						<span className="ml-2 text-red-500">−{removeIds.length} removed</span>
					)}
				</p>
				<div className="flex gap-2">
					<Button color="gray" onClick={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						disabled={!hasChanges}
						onClick={() => { onSave({ addIds, removeIds }); }}
					>
						<FaSave className="mr-2" />
						Save changes
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default AssetManagerModal;
