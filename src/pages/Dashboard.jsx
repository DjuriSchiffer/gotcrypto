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
import Page from "../components/Page";
import PageContainer from "../components/PageContainer";
import Charts from "../components/ChartsDashboard";

const Dashboard = () => {
  const { currencies, selectedCurrencies, globalTotals } = useGlobalState();
  const dispatch = useDispatch();
  const [openRemoveAssetModal, setOpenRemoveAssetModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState({});

  useEffect(() => {
    dispatch({
      type: "SET_GLOBAL_TOTALS",
      payload: getGlobalTotals(selectedCurrencies, currencies),
    });
  }, [selectedCurrencies, currencies, dispatch]);

  const handleRemoveCurrency = (selectedCurrency) => {
    handleGetLocalForage((data) => {
      data = data.filter((item) => !isEqual(item, selectedCurrency));
      handleSetLocalForage(data, () => {
        setOpenRemoveAssetModal(false);
      });
    });
  };

  const handleOrderCurrencyUp = (selectedCurrency) => {
    handleGetLocalForage((data) => {
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
    handleGetLocalForage((data) => {
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

  const handleGetLocalForage = (callback) => {
    localForage
      .getItem("selectedCurrencies")
      .then((data) => {
        if (typeof callback === "function") {
          return callback(data);
        }
      })
      .catch(function (err) {
        console.log(err);
        // This code runs if there were any errors
        dispatch({ type: "SET_ERROR" });
      });
  };

  const handleSetLocalForage = (data, callback) => {
    localForage
      .setItem("selectedCurrencies", data)
      .then((data) => {
        dispatch({
          type: "SET_SELECTED_CURRENCIES",
          payload: data,
        });
        if (typeof callback === "function") {
          return callback();
        }
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
    <Page>
      <PageContainer
        className={
          "container mx-auto bg-gray-dark shadow m-10 flex items-center"
        }
      >
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
      </PageContainer>
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
                      className={
                        "p-2 rounded-md text-black bg-green inline-block"
                      }
                    >
                      <Icon id="Plus" color="white" />
                    </Button>
                    <Button
                      id="action"
                      onClick={() =>
                        handleOpenRemoveAssetModal(selectedCurrency)
                      }
                      className={"p-2 rounded-md text-black bg-red ml-2"}
                    >
                      <Icon id="Remove" color="white" />
                    </Button>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      )}
      {currencies && !isEmpty(selectedCurrencies) && (
        <PageContainer
          className={"container mx-auto flex flex-col items-center"}
        >
          <Charts data={selectedCurrencies} />
        </PageContainer>
      )}

      {isEmpty(selectedCurrencies) && (
        <PageContainer
          className={"container mx-auto flex flex-col items-center"}
        >
          <span className="mb-2">No currencies selected yet</span>
          <SelectCurrencies className={"flex"} />
        </PageContainer>
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
    </Page>
  );
};

export default Dashboard;
