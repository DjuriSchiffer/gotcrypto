import { Card } from 'flowbite-react';
import type { FetchedCurrency, SelectedAsset } from 'currency';
import { getImage } from '../utils/images';
import { useMemo } from 'react';
import { FaCheck } from 'react-icons/fa';

type AssetSelectorProps = {
	options: Array<FetchedCurrency> | undefined;
	preselectedOptions: SelectedAsset[];
	selectedAssets: number[];
	onToggleAsset: (cmcId: number) => void;
	className?: string;
};

export const AssetSelector: React.FC<AssetSelectorProps> = ({
	options,
	preselectedOptions,
	selectedAssets,
	onToggleAsset,
	className = '',
}) => {
	const availableOptions = useMemo(() => {
		if (!options) return [];

		const existingIds = new Set(preselectedOptions.map((asset) => asset.cmc_id));
		return options.filter((option) => !existingIds.has(option.cmc_id));
	}, [options, preselectedOptions]);

	if (availableOptions.length === 0) {
		return (
			<div className={`py-8 text-center ${className}`}>
				<p className="text-gray-500 dark:text-gray-400">No new assets available to add</p>
			</div>
		);
	}

	return (
		<div className={`max-h-[50vh] overflow-y-auto ${className}`}>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{availableOptions.map((option) => (
					<Card
						key={option.cmc_id}
						onClick={() => onToggleAsset(option.cmc_id)}
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
	);
};

export default AssetSelector;
