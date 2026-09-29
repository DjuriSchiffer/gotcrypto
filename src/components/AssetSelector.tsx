import type { FetchedCurrency } from 'currency';

import classNames from 'classnames';
import { TextInput } from 'flowbite-react';
import { useMemo, useState } from 'react';
import { FaCheck, FaSearch } from 'react-icons/fa';

import { filterCoins } from '../utils/assets';
import { getImage } from '../utils/images';

type AssetSelectorProps = {
	/** Coins that can't be picked, e.g. because they're already on the dashboard */
	excludeIds?: Array<number>;
	onToggle: (cmcId: number) => void;
	options: Array<FetchedCurrency>;
	selectedIds: Array<number>;
};

/** A searchable grid of coins to pick from. */
function AssetSelector({ excludeIds = [], onToggle, options, selectedIds }: AssetSelectorProps) {
	const [query, setQuery] = useState('');

	const visible = useMemo(() => {
		const excluded = new Set(excludeIds);
		return filterCoins(options, query).filter((option) => !excluded.has(option.cmc_id));
	}, [options, query, excludeIds]);

	return (
		<div className="flex flex-col gap-3">
			<TextInput
				aria-label="Search coins"
				autoComplete="off"
				icon={FaSearch}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="Search coins, e.g. Bitcoin"
				type="search"
				value={query}
			/>

			{visible.length === 0 ? (
				<p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
					No coins match “{query}”.
				</p>
			) : (
				<div
					aria-label="Coins"
					className="grid max-h-[45vh] grid-cols-1 gap-2 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-3"
					role="group"
				>
					{visible.map((option) => {
						const isSelected = selectedIds.includes(option.cmc_id);

						return (
							<button
								aria-pressed={isSelected}
								className={classNames(
									'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
									isSelected
										? 'border-green-500 bg-green-50 dark:bg-green-900/20'
										: 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
								)}
								key={option.cmc_id}
								onClick={() => onToggle(option.cmc_id)}
								type="button"
							>
								<img
									alt=""
									className="h-6 w-6 rounded-full"
									height={24}
									src={getImage(option.cmc_id)}
									width={24}
								/>
								<span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
									{option.name}
								</span>
								{isSelected && <FaCheck aria-hidden className="shrink-0 text-green-500" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default AssetSelector;
