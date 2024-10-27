import React from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { FetchedCurrency } from '../types/currency';
import { getImage } from '../utils/images';

interface OptionType {
  value: number;
  label: string;
  image: string;
}

interface SearchInputProps {
  options: FetchedCurrency[] | undefined;
  selectedOptions: MultiValue<OptionType>;
  onChange: (selected: MultiValue<OptionType>) => void;
  placeholder?: string;
}

const customStyles: StylesConfig<OptionType, true> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    borderColor: '#374151',
    color: 'white',
    minHeight: '42px'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1F2937',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#374151' : '#1F2937',
    color: 'white',
    ':active': {
      backgroundColor: '#4B5563',
    },
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
    color: 'white',
    ':hover': {
      backgroundColor: '#4B5563',
      color: 'white',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
};

const SearchInput: React.FC<SearchInputProps> = ({
  options,
  selectedOptions,
  onChange,
  placeholder = 'Search and select currencies...',
}) => {
  const selectOptions: OptionType[] = options
    ? options.map((currency) => ({
      value: currency.cmc_id,
      label: currency.name,
      image: getImage(currency.cmc_id),
    }))
    : [];

  const formatOptionLabel = ({ image, label }: OptionType) => (
    <div className="flex items-center">
      <img
        src={image}
        alt={`${label} icon`}
        className="w-6 h-6 mr-2 rounded-full"
      />
      <span>{label}</span>
    </div>
  );

  return (
    <Select
      isMulti
      options={selectOptions}
      value={selectedOptions}
      onChange={onChange}
      placeholder={placeholder}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      classNamePrefix="react-select"
    />
  );
};

export default SearchInput;
