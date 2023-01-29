import { useState as useGlobalState } from "../hooks/useReducer";
import { useEffect, useState } from "react";
import { useDispatch } from "../hooks/useReducer";
import { useLocalForage } from "../hooks/useLocalForage";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { PercentageFormat, CurrencyFormat } from "../utils/CalculateHelpers";
import isEqual from "lodash.isequal";
import isEmpty from "lodash.isempty";
import { getGlobalTotals } from "../utils/totals";
import classNames from "classnames";
import { Button as FBButton } from "flowbite-react";
import { Card } from "flowbite-react";
import Modal from "../components/Modal";
import SelectCurrencies from "../components/SelectCurrencies";
import Page from "../components/Page";
import PageContainer from "../components/PageContainer";
import Charts from "../components/ChartsDashboard";
import Table from "../components/FBTable";
import TableRow from "../components/FBTableRow";

const Dashboard = () => {
  const { currencies, selectedCurrencies, globalTotals } = useGlobalState();
  const [setLocalForage] = useLocalForage();
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
    setLocalForage(
      "selectedCurrencies",
      selectedCurrencies.filter((item) => !isEqual(item, selectedCurrency)),
      () => {
        setOpenRemoveAssetModal(false);
      }
    );
  };

  const handleOrderCurrencyUp = (selectedCurrency) => {
    const currIndex = selectedCurrencies.findIndex((item) => {
      if (item && item.name === selectedCurrency.name) {
        return item;
      }
    });
    const toIndex = currIndex - 1;
    const element = selectedCurrencies.splice(currIndex, 1)[0];
    selectedCurrencies.splice(toIndex, 0, element);
    setLocalForage("selectedCurrencies", selectedCurrencies);
  };

  const handleOrderCurrencyDown = (selectedCurrency) => {
    const currIndex = selectedCurrencies.findIndex((item) => {
      if (item && item.name === selectedCurrency.name) {
        return item;
      }
    });
    const toIndex = currIndex + 1;
    const element = selectedCurrencies.splice(currIndex, 1)[0];
    selectedCurrencies.splice(toIndex, 0, element);
    setLocalForage("selectedCurrencies", selectedCurrencies);
  };

  const handleOpenRemoveAssetModal = (selectedCurrency) => {
    setCurrentCurrency(selectedCurrency);
    setOpenRemoveAssetModal(true);
  };

  return (
    <Page>
      {currencies && selectedCurrencies && !isEmpty(selectedCurrencies) && (
        <>
          <div className={"grid gap-4 mb-4"}>
            <Card>
              <div className={"flex flex-row items-center"}>
                {globalTotals && (
                  <div className={"text-white"}>
                    <div className="text-4xl">
                      {CurrencyFormat(globalTotals.totalValue)}
                    </div>
                    <div
                      className={classNames("text-xl", {
                        "text-blue": globalTotals.totalPercentageDifference > 0,
                        "text-loss": globalTotals.totalPercentageDifference < 0,
                      })}
                    >
                      {PercentageFormat(globalTotals.totalPercentageDifference)}
                    </div>
                  </div>
                )}

                <SelectCurrencies className={"flex ml-auto"} />
              </div>
              <Table type="dashboard">
                {selectedCurrencies.map((selectedCurrency, index) => {
                  return (
                    <TableRow
                      key={index}
                      type="dashboard"
                      item={selectedCurrency}
                      currencies={currencies}
                    >
                      {index > 0 && (
                        <FBButton
                          color="gray"
                          onClick={() =>
                            handleOrderCurrencyUp(selectedCurrency)
                          }
                          className={"rounded-md text-black flex"}
                        >
                          <Icon id="Up" color="white" />
                        </FBButton>
                      )}
                      {index + 1 < selectedCurrencies.length && (
                        <FBButton
                          color="gray"
                          onClick={() =>
                            handleOrderCurrencyDown(selectedCurrency)
                          }
                          className={"rounded-md text-black flex ml-2"}
                        >
                          <Icon id="Down" color="white" />
                        </FBButton>
                      )}
                      <Link to={selectedCurrency.name} className={"ml-2"}>
                        <FBButton>
                          <Icon id="Plus" color="white" />
                        </FBButton>
                      </Link>
                      <FBButton
                        color="failure"
                        onClick={() =>
                          handleOpenRemoveAssetModal(selectedCurrency)
                        }
                        className={"rounded-md text-black bg-red ml-2"}
                      >
                        <Icon id="Remove" color="white" />
                      </FBButton>
                    </TableRow>
                  );
                })}
              </Table>
            </Card>
          </div>
          <div className={"grid gap-4 xl:grid-cols-2 2xl:grid-cols-3"}>
            <Card>
              <Charts data={selectedCurrencies} />
            </Card>
          </div>
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
            <div className="flex justify-center">
              <FBButton
                onClick={() => handleRemoveCurrency(currentCurrency)}
                color={"failure"}
              >
                <Icon id="Remove" color="white" />
                Remove currency
              </FBButton>
            </div>
          </Modal>
        </>
      )}
      {isEmpty(selectedCurrencies) && (
        <PageContainer
          className={"container mx-auto flex flex-col items-center"}
        >
          <span className="mb-2">No currencies selected yet</span>
          <SelectCurrencies className={"flex"} />
        </PageContainer>
      )}
    </Page>
  );
};

export default Dashboard;
