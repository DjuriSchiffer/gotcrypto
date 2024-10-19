import React from 'react';
import { Select } from 'flowbite-react';
import { SortMethod } from 'store';

interface SortSelectorProps {
  sortMethod: SortMethod;
  onChange: (method: SortMethod) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  sortMethod,
  onChange,
}) => {
  return (
    <div className="mb-4 w-full md:w-1/3">
      <label
        htmlFor="sort"
        className="block mb-2 text-sm font-medium text-gray-300"
      >
        Sort By:
      </label>
      <Select
        id="sort"
        value={sortMethod}
        onChange={(e) => onChange(e.target.value as SortMethod)}
      >
        <option value="cmc_rank">Coinmarketcap Ranking</option>
        <option value="has_selected">Selected Status</option>
      </Select>
    </div>
  );
};

export default SortSelector;
