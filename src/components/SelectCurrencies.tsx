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
import { SelectedCurrency } from 'store';
import { FetchedCurrency } from 'currency';

interface SelectCurrenciesProps {
  className?: string;
}

export interface OptionType {
  value: string;
  label: string;
  image?: string;
  disabled?: boolean;
}

const SelectCurrencies: React.FC<SelectCurrenciesProps> = ({ className }) => {
  const { fetchedCurrencies, selectedCurrencies } = useAppState();
  const dispatch = useAppDispatch();
  const { setLocalForage } = useLocalForage();

  const [input, setInput] = useState<SingleValue<OptionType>>(null);
  const [submit, setSubmit] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionType[]>([]);
  const selectInputRef = useRef<any>(null);

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

  useEffect(() => {
    if (submit && input && input.value !== '') {
      const isAlreadySelected = selectedCurrencies.some(
        (item) => item.name === input.value
      );
      if (isAlreadySelected) return;

      const currencyList: FetchedCurrency[] = Object.values(
        fetchedCurrencies || {}
      );

      const currIndex = currencyList.findIndex(
        (item) => item.name === input.value
      );

      if (currIndex === -1) return;

      const selectedCurrency = currencyList[currIndex];

      const newSelectedCurrency: SelectedCurrency = {
        name: selectedCurrency.name,
        slug: selectedCurrency.slug,
        cmc_id: selectedCurrency.cmc_id,
        index: currIndex,
        assets: [],
        totals: totals([]),
      };

      const updatedSelectedCurrencies = [
        ...selectedCurrencies,
        newSelectedCurrency,
      ];

      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        selectInputRef.current?.setValue(defaultValue);
        setSubmit(false);
        dispatch({
          type: 'SET_SELECTED_CURRENCIES',
          payload: updatedSelectedCurrencies,
        });
      });
    }
  }, [
    submit,
    input,
    fetchedCurrencies,
    selectedCurrencies,
    setLocalForage,
    dispatch,
  ]);

  useEffect(() => {
    if (fetchedCurrencies && selectedCurrencies) {
      const newOptions: OptionType[] = Object.values(fetchedCurrencies).map(
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
  }, [fetchedCurrencies, selectedCurrencies]);

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
