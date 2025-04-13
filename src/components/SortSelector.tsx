import type { SortMethod } from 'store';

import { Select } from 'flowbite-react';

type SortSelectorProps = {
	onChange: (method: SortMethod) => void;
	sortMethod: SortMethod;
};

function SortSelector({ onChange, sortMethod }: SortSelectorProps) {
	return (
		<>
			<label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="sort">
				Sort By:
			</label>
			<Select
				id="sort"
				onChange={(e) => {
					onChange(e.target.value as SortMethod);
				}}
				value={sortMethod}
			>
				{/* <option value="cmc_rank">Coinmarketcap Ranking</option> */}
				<option value="has_selected">Selected Status</option>
			</Select>
		</>
	);
}

export default SortSelector;
