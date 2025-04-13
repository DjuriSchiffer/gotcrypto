import type { MultiValue, StylesConfig } from 'react-select';

import Select from 'react-select';

import type { FetchedCurrency } from '../types/currency';

import { getImage } from '../utils/images';

type OptionType = {
	image: string;
	label: string;
	value: number;
};

type SearchInputProps = {
	onChange: (selected: MultiValue<OptionType>) => void;
	options: Array<FetchedCurrency> | undefined;
	placeholder?: string;
	selectedOptions: MultiValue<OptionType>;
};

const customStyles: StylesConfig<OptionType, true> = {
	control: (provided) => ({
		...provided,
		backgroundColor: 'transparent',
		borderColor: '#374151',
		color: 'white',
		minHeight: '42px',
	}),
	input: (provided) => ({
		...provided,
		color: 'white',
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: '#1F2937',
	}),
	multiValue: (provided) => ({
		...provided,
		backgroundColor: '#374151',
		color: 'white',
	}),
	multiValueLabel: (provided) => ({
		...provided,
		color: 'white',
	}),
	multiValueRemove: (provided) => ({
		...provided,
		':hover': {
			backgroundColor: '#4B5563',
			color: 'white',
		},
		color: 'white',
	}),
	option: (provided, state) => ({
		...provided,
		':active': {
			backgroundColor: '#4B5563',
		},
		backgroundColor: state.isFocused ? '#374151' : '#1F2937',
		color: 'white',
	}),
	singleValue: (provided) => ({
		...provided,
		color: 'white',
	}),
};

function SearchInput({
	onChange,
	options,
	placeholder = 'Search and select currencies...',
	selectedOptions,
}: SearchInputProps) {
	const selectOptions: Array<OptionType> = options
		? options.map((asset) => ({
				image: getImage(asset.cmc_id),
				label: asset.name,
				value: asset.cmc_id,
			}))
		: [];

	const formatOptionLabel = ({ image, label }: OptionType) => (
		<div className="flex items-center">
			<img alt={`${label} icon`} className="mr-2 h-6 w-6 rounded-full" src={image} />
			<span>{label}</span>
		</div>
	);

	return (
		<Select
			classNamePrefix="react-select"
			formatOptionLabel={formatOptionLabel}
			isMulti
			onChange={onChange}
			options={selectOptions}
			placeholder={placeholder}
			styles={customStyles}
			value={selectedOptions}
		/>
	);
}

export default SearchInput;
