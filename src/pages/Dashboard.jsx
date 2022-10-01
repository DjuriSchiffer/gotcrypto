import { useState as useGlobalState } from "../hooks/useReducer";
import { useEffect, useState } from "react";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { PercentageFormat, CurrencyFormat } from "../utils/CalculateHelpers";
import isEqual from "lodash.isequal";
import isEmpty from "lodash.isempty";
import { getGlobalTotals } from "../utils/totals";
import classNames from "classnames";
import Table from "../components/Table";
import TableHead from "../components/TableHead";
import TableBody from "../components/TableBody";
import TableRow from "../components/TableRow";
import Modal from "../components/Modal";
import SelectCurrencies from "../components/SelectCurrencies";

const Dashboard = () => {
  const { currencies, selectedCurrencies, globalTotals } = useGlobalState();
  const dispatch = useDispatch();
  const [openRemoveAssetModal, setOpenRemoveAssetModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState({});

  useEffect(() => {
    dispatch({
      type: "SET_GLOBAL_TOTALS",
      payload: getGlobalTotals(selectedCurrencies),
    });
  }, [selectedCurrencies, dispatch]);

  const handleRemoveCurrency = (selectedCurrency) => {
    localForage.getItem("selectedCurrencies").then((data) => {
      data = data.filter((item) => !isEqual(item, selectedCurrency));
      handleSetLocalForage(data);
      setOpenRemoveAssetModal(false);
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
      handleSetLocalForage(data);
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
      handleSetLocalForage(data);
    });
  };

  const handleOpenRemoveAssetModal = (selectedCurrency) => {
    setCurrentCurrency(selectedCurrency);
    setOpenRemoveAssetModal(true);
  };

  const handleSetLocalForage = (data) => {
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
        {!isEmpty(selectedCurrencies) && (
          <SelectCurrencies className={"flex ml-auto"} />
        )}
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
                      <Icon id="Plus" color="white" />
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
          <SelectCurrencies className={"flex"} />
        </div>
      )}
      <Modal
        open={openRemoveAssetModal}
        title={
          "Are you sure you want to remove this currency and its associated assets?"
        }
        onClose={() => setOpenRemoveAssetModal(false)}
      >
        <Icon
          id="Warning"
          color="white"
          className="flex mx-auto mb-4 text-6xl"
        />
        <Button
          id="action"
          onClick={() => handleRemoveCurrency(currentCurrency)}
          text="Remove currency"
          className={
            "p-2 rounded-md text-white flex items-center bg-red mx-auto"
          }
        >
          <Icon id="Remove" color="white" />
        </Button>
      </Modal>
    </div>
  );
};

export default Dashboard;
