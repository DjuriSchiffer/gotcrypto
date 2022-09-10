import { useState as useGlobalState } from "../hooks/useReducer";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { PercentageFormat, CurrencyFormat } from "../utils/CalculateHelpers";
import isEqual from "lodash.isequal";
import isEmpty from "lodash.isempty";
import totals, { getGlobalTotals } from "../utils/totals";
import Select from "react-select";
import classNames from "classnames";
import Table from "../components/Table";
import TableHead from "../components/TableHead";
import TableBody from "../components/TableBody";
import TableRow from "../components/TableRow";
import Modal from "../components/Modal";

const Dashboard = () => {
  const { currencies, selectedCurrencies, globalTotals } = useGlobalState();
  const dispatch = useDispatch();
  const [input, setInput] = useState({});
  const [submit, setSubmit] = useState(false);
  const [options, setOptions] = useState([]);
  const [openRemoveAssetModal, setOpenRemoveAssetModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState({});
  const defaultValue = {
    label: "Select currency",
    value: null,
  };
  const selectInputRef = useRef();

  useEffect(() => {
    dispatch({
      type: "SET_GLOBAL_TOTALS",
      payload: getGlobalTotals(selectedCurrencies),
    });
  }, [selectedCurrencies, dispatch]);

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

  const handleRemoveCurrency = (selectedCurrency) => {
    localForage.getItem("selectedCurrencies").then((data) => {
      data = data.filter((item) => !isEqual(item, selectedCurrency));
      localForage
        .setItem("selectedCurrencies", data)
        .then((data) => {
          dispatch({
            type: "SET_SELECTED_CURRENCIES",
            payload: data,
          });
          setOpenRemoveAssetModal(false);
        })
        .catch(function (err) {
          // This code runs if there were any errors
          console.log(err);
          dispatch({
            type: "SET_ERROR",
            payload: err,
          });
        });
    });
  };

  const handleOrderCurrencyUp = (selectedCurrency) => {
    localForage.getItem("selectedCurrencies").then((data) => {
      const currIndex = data.findIndex((item) => {
        if (item && item.name === selectedCurrency.name) {
          return item;
        }
      });
      const toIndex = currIndex - 1;
      const element = data.splice(currIndex, 1)[0];
      data.splice(toIndex, 0, element);

      localForage
        .setItem("selectedCurrencies", data)
        .then((data) => {
          dispatch({
            type: "SET_SELECTED_CURRENCIES",
            payload: data,
          });
        })
        .catch(function (err) {
          // This code runs if there were any errors
          console.log(err);
          dispatch({
            type: "SET_ERROR",
            payload: err,
          });
        });
    });
  };

  const handleOrderCurrencyDown = (selectedCurrency) => {
    localForage.getItem("selectedCurrencies").then((data) => {
      const currIndex = data.findIndex((item) => {
        if (item && item.name === selectedCurrency.name) {
          return item;
        }
      });
      const toIndex = currIndex + 1;
      const element = data.splice(currIndex, 1)[0];
      data.splice(toIndex, 0, element);

      localForage
        .setItem("selectedCurrencies", data)
        .then((data) => {
          dispatch({
            type: "SET_SELECTED_CURRENCIES",
            payload: data,
          });
        })
        .catch(function (err) {
          // This code runs if there were any errors
          console.log(err);
          dispatch({
            type: "SET_ERROR",
            payload: err,
          });
        });
    });
  };

  const handleOpenRemoveAssetModal = (selectedCurrency) => {
    setCurrentCurrency(selectedCurrency);
    setOpenRemoveAssetModal(true);
  };

  const form = (className) => {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <Select
          ref={selectInputRef}
          setValue={input}
          defaultValue={defaultValue}
          onChange={setInput}
          options={options}
          isOptionDisabled={(option) => option.disabled}
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

  return (
    <div className="bg-gray-dark p-8 min-h-screen">
      <div className="container mx-auto bg-gray-dark shadow m-10 flex items-center">
        {globalTotals && (
          <div>
            <div className="text-4xl">
              {CurrencyFormat(globalTotals.totalValue)}
            </div>
            <div
              className={classNames("text-xl", {
                "text-green": globalTotals.totalPercentageDifference > 0,
                "text-red": globalTotals.totalPercentageDifference < 0,
              })}
            >
              {PercentageFormat(globalTotals.totalPercentageDifference)}
            </div>
          </div>
        )}
        {!isEmpty(selectedCurrencies) && form("flex ml-auto")}
      </div>
      {!isEmpty(selectedCurrencies) && (
        <Table
          className={"container mx-auto bg-gray-dark shadow-line p-8 m-10"}
        >
          <TableHead className={"shadow-line"} type="dashboard" />
          <TableBody>
            {currencies &&
              selectedCurrencies &&
              selectedCurrencies.map((selectedCurrency, index) => {
                return (
                  <TableRow
                    key={index}
                    type="dashboard"
                    item={selectedCurrency}
                    currencies={currencies}
                  >
                    {index > 0 && (
                      <Button
                        id="action"
                        onClick={() => handleOrderCurrencyUp(selectedCurrency)}
                        className={"p-2 rounded-md text-black flex"}
                      >
                        <Icon id="Up" color="white" />
                      </Button>
                    )}
                    {index + 1 < selectedCurrencies.length && (
                      <Button
                        id="action"
                        onClick={() =>
                          handleOrderCurrencyDown(selectedCurrency)
                        }
                        className={"p-2 rounded-md text-black flex"}
                      >
                        <Icon id="Down" color="white" />
                      </Button>
                    )}
                    <Button
                      id="link"
                      to={selectedCurrency.name}
                      className={"p-2 rounded-md text-black inline-block"}
                    >
                      <Icon id="Edit" color="white" />
                    </Button>
                    <Button
                      id="action"
                      onClick={() =>
                        handleOpenRemoveAssetModal(selectedCurrency)
                      }
                      className={"p-2 rounded-md text-black"}
                    >
                      <Icon id="Remove" color="white" />
                    </Button>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      )}
      {isEmpty(selectedCurrencies) && (
        <div className="container mx-auto flex flex-col items-center">
          <span className="mb-2">No currencies selected yet</span>
          {form("flex")}
        </div>
      )}
      <Modal
        open={openRemoveAssetModal}
        title={
          "Are you sure you want to remove this currency and its associated assets?"
        }
        onClose={() => setOpenRemoveAssetModal(false)}
      >
        <Button
          id="action"
          onClick={() => handleRemoveCurrency(currentCurrency)}
          text="Remove currency"
          className={"p-2 rounded-md text-white flex items-center bg-red"}
        >
          <Icon id="Remove" color="white" />
        </Button>
      </Modal>
    </div>
  );
};

export default Dashboard;
