import { useEffect, useState, useCallback } from "react";
import { useState as useGlobalState } from "../hooks/useReducer";
import AddAssetForm from "../components/AddAssetForm";
import { useLocalForage } from "../hooks/useLocalForage";
import { useParams } from "react-router-dom";
import totals from "../utils/totals";
import uniqueId from "lodash.uniqueid";
import isEmpty from "lodash.isempty";
import { CurrencyFormat } from "../utils/CalculateHelpers";
import Button from "../components/Button";
import ButtonWrapper from "../components/ButtonWrapper";
import Icon from "../components/Icon";
import Table from "../components/Table";
import TableHead from "../components/TableHead";
import TableBody from "../components/TableBody";
import TableRow from "../components/TableRow";
import Modal from "../components/Modal";
import Page from "../components/Page";
import PageContainer from "../components/PageContainer";
import OverviewChart from "../components/ChartsOverview";

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
    const value = event.target.value;
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
    setInputs({
      amount: "",
      purchasePrice: "",
      date: "",
    });
  }

  return (
    <Page>
      <PageContainer className={"container mx-auto"}>
        <ButtonWrapper className={"mb-5 flex items-center"}>
          <Icon id="Left" color="white" />
          <Button
            id="link"
            className="ml-1"
            to="/"
            text="Return to dashboard"
          ></Button>
        </ButtonWrapper>
        {currentCurrency && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl flex mb-1 items-center">
                <img
                  className="inline-block mr-2"
                  width={32}
                  height={32}
                  src={`https://s2.coinmarketcap.com/static/img/coins/32x32/${currentCurrency.cmc_id}.png`}
                />
                {currentCurrency.name}
              </div>
              <div className="text-xl">
                {CurrencyFormat(currentCurrency.price)}
                <span className="text-sm ml-1">current price</span>
              </div>
            </div>
            {currentSelectedCurrency?.assets &&
              currentSelectedCurrency.assets.length > 0 && (
                <ButtonWrapper className={"flex"}>
                  <Button
                    id="action"
                    onClick={() => handleOpenAddAssetModal("add")}
                    text="Add Asset"
                    className="bg-green p-2 rounded-md shadow text-white flex items-center"
                  >
                    <Icon id="Plus" color="white" />
                  </Button>
                  <Button
                    id="action"
                    onClick={() => setOpenRemoveAllAssetsModal(true)}
                    text="Remove all assets"
                    className="bg-red p-2 ml-2 rounded-md shadow text-white flex items-center"
                  >
                    <Icon id="Remove" color="white" />
                  </Button>
                </ButtonWrapper>
              )}
          </div>
        )}
      </PageContainer>
      {currentSelectedCurrency?.assets &&
        currentSelectedCurrency.assets.length > 0 && (
          <Table
            className={"container mx-auto bg-gray-dark shadow-line p-8 m-10"}
          >
            <TableHead className={"shadow-line"} type={"overview"} />
            <TableBody>
              {currentCurrency &&
                currentSelectedCurrency &&
                currentSelectedCurrency?.assets &&
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
                        className="p-2 rounded-md text-black"
                      >
                        <Icon id="Edit" color="white" />
                      </Button>
                      <Button
                        id="action"
                        onClick={() => handleOpenRemoveAssetModal(item)}
                        className="p-2 rounded-md text-black"
                      >
                        <Icon id="Remove" color="white" />
                      </Button>
                    </TableRow>
                  );
                })}
              {currentCurrency &&
                currentSelectedCurrency &&
                currentSelectedCurrency?.totals && (
                  <TableRow
                    type="overview-totals"
                    item={currentSelectedCurrency.totals}
                    currentCurrency={currentCurrency}
                  ></TableRow>
                )}
            </TableBody>
          </Table>
        )}

      {currentSelectedCurrency?.assets &&
        currentSelectedCurrency.assets.length > 0 && (
          <PageContainer
            className={"container mx-auto flex flex-col items-center"}
          >
            <OverviewChart data={currentSelectedCurrency} />
          </PageContainer>
        )}

      {isEmpty(currentSelectedCurrency?.assets) && (
        <PageContainer
          className={"container mx-auto flex flex-col items-center"}
        >
          <span className="mb-2">No assets added yet</span>
          <Button
            id="action"
            onClick={() => handleOpenAddAssetModal("add")}
            text="Add Asset"
            className="bg-green p-2 rounded-md shadow text-white flex items-center"
          >
            <Icon id="Plus" color="white" />
          </Button>
        </PageContainer>
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
        <Button
          id="action"
          onClick={() => handleRemoveAsset(currentItem)}
          className="p-2 rounded-md text-white flex items-center bg-red mx-auto"
          text="Remove asset"
        >
          <Icon id="Remove" color="white" />
        </Button>
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
        <Button
          id="action"
          onClick={() => handleRemoveAllAssets(overviewSlug)}
          className="p-2 rounded-md text-white flex items-center bg-red mx-auto"
          text="Remove all assets"
        >
          <Icon id="Remove" color="white" />
        </Button>
      </Modal>
    </Page>
  );
};

export default Overview;
