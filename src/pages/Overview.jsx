import { useEffect, useState, useCallback } from "react";
import { useState as useGlobalState } from "../hooks/useReducer";
import AddAssetForm from "../components/AddAssetForm";
import { useLocalForage } from "../hooks/useLocalForage";
import { useParams } from "react-router-dom";
import totals from "../utils/totals";
import uniqueId from "lodash.uniqueid";
import { CurrencyFormat } from "../utils/CalculateHelpers";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Page from "../components/Page";
import OverviewChart from "../components/ChartsOverview";
import { getImage } from "../utils/images";
import { Card, Button, Spinner } from "flowbite-react";
import Table from "../components/Table";
import TableRow from "../components/TableRow";
import { Link } from "react-router-dom";
import { formatDatePickerDate } from "../utils/CalculateHelpers";

const Overview = () => {
  const { currencies, selectedCurrencies } = useGlobalState();
  const [setLocalForage] = useLocalForage();
  const { overviewSlug } = useParams();
  const [currentCurrency, setCurrentCurrency] = useState({});
  const [currentSelectedCurrency, setCurrentSelectedCurrency] = useState({});
  const [formType, setFormType] = useState("add");
  const [inputs, setInputs] = useState({
    amount: "",
    purchasePrice: "",
    date: "",
  });
  const [submit, setSubmit] = useState(false);
  const [openAddAssetModal, setOpenAddAssetModal] = useState(false);
  const [openRemoveAssetModal, setOpenRemoveAssetModal] = useState(false);
  const [openRemoveAllAssetsModal, setOpenRemoveAllAssetsModal] =
    useState(false);
  const [currentItem, setCurrentItem] = useState({});

  useEffect(() => {
    if (currencies !== null) {
      const currIndex = currencies.findIndex((e) => {
        if (e && e.name === overviewSlug) {
          return e;
        }
      });
      setCurrentCurrency(currencies[currIndex]);
    }
  }, [currencies, overviewSlug]);

  useEffect(() => {
    if (overviewSlug) {
      setCurrentSelectedCurrency(
        selectedCurrencies.find((e) => e.name === overviewSlug)
      );
    }
  }, [selectedCurrencies, overviewSlug]);

  useEffect(() => {
    if (submit) {
      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === currentCurrency.name
      );

      console.log(inputs);

      inputs.purchasePrice = inputs.purchasePrice.replace(",", ".");

      // Add
      if (formType === "add") {
        selectedCurrencies[currIndex].assets.push(inputs);
      }

      // Edit
      if (formType === "edit") {
        const foundIndex = selectedCurrencies[currIndex].assets.findIndex(
          (x) => x.id == currentItem.id
        );
        selectedCurrencies[currIndex].assets[foundIndex] = inputs;
      }

      // Calculate totals
      selectedCurrencies[currIndex].totals = totals(
        selectedCurrencies[currIndex].assets,
        currentCurrency
      );

      // Sort assets arr by date
      selectedCurrencies[currIndex].assets.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setLocalForage("selectedCurrencies", selectedCurrencies, () => {
        setCurrentSelectedCurrency(selectedCurrencies[currIndex]);
        setCurrentItem({});
        setOpenAddAssetModal(false);
        resetInputs();
      });
    }
    setSubmit(false);
  }, [submit, inputs, currentCurrency, formType, currentItem]);

  const handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;

    if (name === "purchasePrice" && (isNaN(value) || value.includes(","))) {
      if (value.includes(",")) {
        value = value.replace(",", ".");
      } else {
        return;
      }
    }

    setInputs((values) => ({
      ...values,
      [name]: value,
      id: currentItem?.id ? currentItem?.id : uniqueId(),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
    event.target.reset();
  };

  const handleRemoveAsset = useCallback(
    (asset) => {
      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === overviewSlug
      );
      selectedCurrencies[currIndex].assets = selectedCurrencies[
        currIndex
      ].assets.filter((item) => item.id !== asset.id);
      selectedCurrencies[currIndex].totals = totals(
        selectedCurrencies[currIndex].assets,
        currentCurrency
      );
      setLocalForage("selectedCurrencies", selectedCurrencies, () => {
        setCurrentSelectedCurrency(selectedCurrencies[currIndex]);
        setOpenRemoveAssetModal(false);
      });
    },
    [overviewSlug, selectedCurrencies]
  );

  const handleRemoveAllAssets = useCallback(
    (overviewSlug) => {
      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === overviewSlug
      );
      selectedCurrencies[currIndex].assets = [];
      selectedCurrencies[currIndex].totals = totals(
        selectedCurrencies[currIndex].assets,
        currentCurrency
      );
      setLocalForage("selectedCurrencies", selectedCurrencies, () => {
        setCurrentSelectedCurrency(selectedCurrencies[currIndex]);
        setOpenRemoveAllAssetsModal(false);
      });
    },
    [overviewSlug, selectedCurrencies]
  );

  const handleOpenAddAssetModal = (type, item) => {
    setFormType(type);
    if (type === "add") {
      resetInputs();
    }
    if (type === "edit") {
      setCurrentItem(item);
      setInputs(item);
    }
    setOpenAddAssetModal(true);
  };

  const handleOpenRemoveAssetModal = (item) => {
    setCurrentItem(item);
    setOpenRemoveAssetModal(true);
  };

  function resetInputs() {
    console.log("reset");
    setInputs({
      amount: "",
      purchasePrice: "",
      date: formatDatePickerDate(new Date()),
    });
  }

  return (
    <Page>
      {currencies && currentCurrency && currentSelectedCurrency && (
        <div className={"grid gap-4 xl:grid-cols-2 2xl:grid-cols-6 mb-4"}>
          <div>
            <Link
              to={"/"}
              className={
                "mb-4 inline-flex items-center justify-center p-5 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
              }
            >
              <Icon className={"mr-1"} id="Left" color="white" />
              Return to dashboard
            </Link>
          </div>

          <Card className={"2xl:col-span-5"}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl flex mb-1 items-center text-white">
                  <img
                    className="inline-block mr-2"
                    width={32}
                    height={32}
                    src={getImage(currentCurrency.cmc_id)}
                  />
                  {currentCurrency.slug}
                </div>
                <div className="text-xl text-white">
                  {CurrencyFormat(currentCurrency.price)}
                  <span className="text-sm ml-1">current price</span>
                </div>
              </div>
              <div className={"ml-auto flex"}>
                <Button
                  onClick={() => handleOpenAddAssetModal("add")}
                  className={"mr-2"}
                >
                  Add Asset
                  <Icon id="Plus" color="white" className={"ml-1"} />
                </Button>
                <Button
                  onClick={() => setOpenRemoveAllAssetsModal(true)}
                  color={"failure"}
                >
                  Remove all assets
                  <Icon id="Remove" color="white" className={"ml-1"} />
                </Button>
              </div>
            </div>

            <Table type={"overview"}>
              {currentSelectedCurrency?.assets?.length > 0 &&
                currentSelectedCurrency.assets.map((item, index) => {
                  return (
                    <TableRow
                      key={index}
                      type="overview"
                      item={item}
                      currentCurrency={currentCurrency}
                    >
                      <Button
                        id="action"
                        onClick={() => handleOpenAddAssetModal("edit", item)}
                      >
                        <Icon id="Edit" color="white" />
                      </Button>
                      <Button
                        onClick={() => handleOpenRemoveAssetModal(item)}
                        color={"failure"}
                        className={"ml-2"}
                      >
                        <Icon id="Remove" color="white" />
                      </Button>
                    </TableRow>
                  );
                })}
              {currentSelectedCurrency?.assets?.length > 0 &&
                currentSelectedCurrency?.totals && (
                  <TableRow
                    type="overview-totals"
                    item={currentSelectedCurrency.totals}
                    currentCurrency={currentCurrency}
                  ></TableRow>
                )}
            </Table>
          </Card>
          {currentSelectedCurrency?.assets?.length > 0 &&
            currentSelectedCurrency?.totals && (
              <Card className={"2xl:col-start-2 2xl:col-span-5"}>
                <OverviewChart data={currentSelectedCurrency} />
              </Card>
            )}
        </div>
      )}
      {!currencies && (
        <div className={"text-white flex align-center"}>
          <Spinner
            color="success"
            aria-label="Fetching data from Coinmarketcap"
          />
          <span className={"ml-2"}>Fetching data from Coinmarketcap...</span>
        </div>
      )}

      <Modal
        onClose={() => setOpenAddAssetModal(false)}
        open={openAddAssetModal}
        title={formType === "add" ? "Add asset" : "Edit asset"}
      >
        <AddAssetForm
          onSubmit={handleSubmit}
          className={"flex flex-col"}
          amount={inputs.amount}
          price={inputs.purchasePrice}
          date={inputs.date}
          handleChange={handleChange}
          formType={formType}
        />
      </Modal>
      <Modal
        onClose={() => setOpenRemoveAssetModal(false)}
        open={openRemoveAssetModal}
        title={"Are you sure you want to remove this asset?"}
      >
        <Icon
          id="Warning"
          color="white"
          className="flex mx-auto mb-4 text-6xl"
        />
        <div className="flex justify-center">
          <Button
            color={"failure"}
            onClick={() => handleRemoveAsset(currentItem)}
          >
            <Icon id="Remove" color="white" />
            Remove asset
          </Button>
        </div>
      </Modal>
      <Modal
        onClose={() => setOpenRemoveAllAssetsModal(false)}
        open={openRemoveAllAssetsModal}
        title={"Are you sure you want to remove all assets?"}
      >
        <Icon
          id="Warning"
          color="white"
          className="flex mx-auto mb-4 text-6xl"
        />
        <div className="flex justify-center">
          <Button
            onClick={() => handleRemoveAllAssets(overviewSlug)}
            color={"failure"}
          >
            <Icon id="Remove" color="white" className={"mr-1"} />
            Remove all assets
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default Overview;
