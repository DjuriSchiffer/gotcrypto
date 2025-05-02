import type { MultiValue, StylesConfig } from 'react-select';
import Select from 'react-select';
import { useThemeMode } from 'flowbite-react';

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

function SearchInput({
	onChange,
	options,
	placeholder = 'Search and select currencies...',
	selectedOptions,
}: SearchInputProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';

	const customStyles: StylesConfig<OptionType, true> = {
		control: (provided) => ({
			...provided,
			backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
			borderColor: isDarkMode ? '#374151' : '#E5E7EB',
			color: isDarkMode ? 'white' : 'black',
			minHeight: '42px',
			borderRadius: '0.5rem',
		}),
		input: (provided) => ({
			...provided,
			color: isDarkMode ? 'white' : 'black',
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: isDarkMode ? '#1F2937' : 'white',
		}),
		multiValue: (provided) => ({
			...provided,
			backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
			color: isDarkMode ? 'white' : 'black',
		}),
		multiValueLabel: (provided) => ({
			...provided,
			color: isDarkMode ? 'white' : 'black',
		}),
		multiValueRemove: (provided) => ({
			...provided,
			':hover': {
				backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
				color: isDarkMode ? 'white' : 'black',
			},
			color: isDarkMode ? 'white' : 'black',
		}),
		option: (provided, state) => ({
			...provided,
			':active': {
				backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
			},
			backgroundColor: state.isFocused
				? isDarkMode
					? '#374151'
					: '#F3F4F6'
				: isDarkMode
					? '#1F2937'
					: 'white',
			color: isDarkMode ? 'white' : 'black',
		}),
		singleValue: (provided) => ({
			...provided,
			color: isDarkMode ? 'white' : 'black',
		}),
	};

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
