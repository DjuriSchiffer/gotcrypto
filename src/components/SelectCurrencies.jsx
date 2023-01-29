import { useState as useGlobalState } from "../hooks/useReducer";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocalForage } from "../hooks/useLocalForage";
import totals from "../utils/totals";
import Select from "react-select";
import { getImage } from "../utils/images";
import { Button as FBButton } from "flowbite-react";

const SelectCurrencies = ({ className }) => {
  const { currencies, selectedCurrencies } = useGlobalState();
  const [setLocalForage] = useLocalForage();
  const [input, setInput] = useState({});
  const [submit, setSubmit] = useState(false);
  const [options, setOptions] = useState([]);
  const selectInputRef = useRef();
  const defaultValue = {
    label: "Select currency",
    value: null,
  };
  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles, { isDisabled }) => {
      return {
        ...styles,
        cursor: isDisabled ? "not-allowed" : "default",
        color: isDisabled ? "#aaa" : "#fff",
        height: "100%",
      };
    },
    // For the options
    option: (styles, { isDisabled }) => {
      return {
        ...styles,
        backgroundColor: isDisabled ? "#d3dce6" : "#fff",
        cursor: isDisabled ? "not-allowed" : "default",
      };
    },
  };

  useEffect(() => {
    if (submit && input && input.value !== null) {
      if (
        selectedCurrencies.filter((item) => item.name === input.value).length >
        0
      )
        return;

      const currIndex = currencies.findIndex((item) => {
        if (item && item.name === input.value) {
          return item;
        }
      });
      selectedCurrencies.push({
        name: input.value,
        label: input.label,
        index: currIndex,
        assets: [],
        totals: totals([], currencies[currIndex]),
      });
      setLocalForage("selectedCurrencies", selectedCurrencies, () => {
        selectInputRef.current.setValue(defaultValue);
        setSubmit(false);
      });
    }
  }, [submit, input]);

  useEffect(() => {
    if (currencies !== null && selectedCurrencies) {
      // console.log(currencies);
      setOptions(
        currencies.map((currency, i) => {
          let isDisabled = false;
          selectedCurrencies.forEach((element) => {
            if (element.name === currency.name) {
              isDisabled = true;
            }
          });
          return {
            value: currency.name,
            label: currency.slug,
            image: getImage(currency.cmc_id),
            disabled: isDisabled,
          };
        })
      );
    }
  }, [currencies, selectedCurrencies, submit]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSubmit(true);
    },
    [submit]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Select
        ref={selectInputRef}
        setValue={input}
        defaultValue={defaultValue}
        onChange={setInput}
        options={options}
        isOptionDisabled={(option) => option.disabled}
        styles={customStyles}
        formatOptionLabel={(item) => (
          <div className="flex items-center">
            {item.image && <img width={32} height={32} src={item.image} />}
            <span className="text-black ml-2">{item.label}</span>
          </div>
        )}
      />
      <FBButton disabled={!input.value} type="submit" className={"ml-2"}>
        Add Currency
      </FBButton>
    </form>
  );
};

export default SelectCurrencies;
