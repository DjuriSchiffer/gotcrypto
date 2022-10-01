import { useState as useGlobalState } from "../hooks/useReducer";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "../hooks/useReducer";
import totals from "../utils/totals";
import localForage from "localforage";
import Select from "react-select";

const SelectCurrencies = ({ className }) => {
  const { currencies, selectedCurrencies } = useGlobalState();
  const dispatch = useDispatch();
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
      localForage
        .getItem("selectedCurrencies")
        .then((data) => {
          if (data.filter((item) => item.name === input.value).length > 0)
            return;
          const currIndex = currencies.findIndex((item) => {
            if (item && item.name === input.value) {
              return item;
            }
          });
          const object = {
            name: input.value,
            label: input.label,
            index: currIndex,
            assets: [],
            totals: totals([], currencies[currIndex]),
          };
          data.push(object);
          localForage.setItem("selectedCurrencies", data).then((data) => {
            dispatch({
              type: "SET_SELECTED_CURRENCIES",
              payload: data,
            });
          });
          selectInputRef.current.setValue(defaultValue);
        })
        .catch(function (err) {
          // This code runs if there were any errors
          dispatch({
            type: "SET_ERROR",
            payload: err,
          });
        });
    }
    setSubmit(false);
  }, [submit, input]);

  useEffect(() => {
    if (currencies !== null && selectedCurrencies) {
      let optionsArr = [];
      currencies.map((currency, i) => {
        let isDisabled = false;
        selectedCurrencies.forEach((element) => {
          if (element.name === currency.name) {
            isDisabled = true;
          }
        });

        optionsArr.push({
          value: currency.name,
          label: currency.slug,
          image: `https://s2.coinmarketcap.com/static/img/coins/32x32/${currency.cmc_id}.png`,
          disabled: isDisabled,
        });
      });
      setOptions(optionsArr);
    }
  }, [currencies, selectedCurrencies]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
  };

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
      <input
        className="bg-green p-2 rounded-md shadow text-white ml-2 disabled:bg-gray-light"
        type="submit"
        value="add new"
        disabled={!input.value}
      />
    </form>
  );
};

export default SelectCurrencies;
