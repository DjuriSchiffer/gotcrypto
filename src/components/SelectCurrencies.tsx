// src/components/SelectCurrencies.tsx

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  FormEvent,
} from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { useLocalForage } from '../hooks/useLocalForage';
import { useAppState, useAppDispatch } from '../hooks/useReducer';
import totals from '../utils/totals';
import { getImage } from '../utils/images';
import { Button } from 'flowbite-react';
import { Currency, OptionType, AppState } from '../types';

interface SelectCurrenciesProps {
  className?: string;
}

const SelectCurrencies: React.FC<SelectCurrenciesProps> = ({ className }) => {
  const { currencies, selectedCurrencies } = useAppState();
  const dispatch = useAppDispatch();
  const { setLocalForage } = useLocalForage();

  const [input, setInput] = useState<SingleValue<OptionType>>(null);
  const [submit, setSubmit] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionType[]>([]);
  const selectInputRef = useRef<Select<OptionType, false>>(null);

  const defaultValue: OptionType = {
    label: 'Select currency',
    value: '',
  };

  const customStyles: StylesConfig<OptionType, false> = {
    control: (styles, { isDisabled }) => ({
      ...styles,
      cursor: isDisabled ? 'not-allowed' : 'default',
      color: isDisabled ? '#aaa' : '#fff',
      height: '100%',
    }),
    option: (styles, { isDisabled }) => ({
      ...styles,
      backgroundColor: isDisabled ? '#d3dce6' : '#fff',
      cursor: isDisabled ? 'not-allowed' : 'default',
    }),
  };

  // Effect to handle form submission
  useEffect(() => {
    if (submit && input && input.value !== '') {
      // Check if the currency is already selected
      const isAlreadySelected = selectedCurrencies.some(
        (item) => item.name === input.value
      );
      if (isAlreadySelected) return;

      // Convert Record to Array
      const currencyList: Currency[] = Object.values(currencies || {});

      // Find the index of the selected currency
      const currIndex = currencyList.findIndex(
        (item) => item.name === input.value
      );

      if (currIndex === -1) return; // Currency not found

      const selectedCurrency = currencyList[currIndex];

      // Create a new selected currency object
      const newSelectedCurrency: Currency = {
        name: selectedCurrency.name,
        slug: selectedCurrency.slug,
        cmc_id: selectedCurrency.cmc_id,
        index: currIndex,
        assets: [],
        totals: totals([], selectedCurrency),
      };

      // Update selected currencies immutably
      const updatedSelectedCurrencies = [
        ...selectedCurrencies,
        newSelectedCurrency,
      ];

      // Persist to localForage
      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        // Reset the select input
        selectInputRef.current?.setValue(defaultValue);
        setSubmit(false);
        // Dispatch an action to update the global state
        dispatch({
          type: 'SET_SELECTED_CURRENCIES',
          payload: updatedSelectedCurrencies,
        });
      });
    }
  }, [submit, input, currencies, selectedCurrencies, setLocalForage, dispatch]);

  // Effect to set options based on available currencies
  useEffect(() => {
    if (currencies && selectedCurrencies) {
      const newOptions: OptionType[] = Object.values(currencies).map(
        (currency) => {
          const isDisabled = selectedCurrencies.some(
            (selected) => selected.name === currency.name
          );
          return {
            value: currency.name,
            label: currency.slug,
            image: getImage(currency.cmc_id),
            disabled: isDisabled,
          };
        }
      );
      setOptions(newOptions);
    }
  }, [currencies, selectedCurrencies]);

  // Handle form submission
  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmit(true);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Select
        ref={selectInputRef}
        value={input}
        defaultValue={defaultValue}
        onChange={setInput}
        options={options}
        isOptionDisabled={(option) => option.disabled || false}
        styles={customStyles}
        formatOptionLabel={(option) => (
          <div className="flex items-center">
            {option.image && (
              <img
                width={32}
                height={32}
                src={option.image}
                alt={`${option.label} icon`}
              />
            )}
            <span className="text-black ml-2">{option.label}</span>
          </div>
        )}
      />
      <Button disabled={!input?.value} type="submit" className="ml-2">
        Add Currency
      </Button>
    </form>
  );
};

export default SelectCurrencies;
