import { useEffect, useState, useCallback } from "react";
import { useState as useGlobalState } from "../hooks/useReducer";
import AddAssetForm from "../components/AddAssetForm";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
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

const Overview = () => {
  const { currencies } = useGlobalState();
  const dispatch = useDispatch();
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
      handleGetLocalForage((data) => {
        handleSetLocalForage(data, () => {
          dispatch({
            type: "SET_SELECTED_CURRENCIES",
            payload: data,
          });
          setCurrentSelectedCurrency(data.find((e) => e.name === overviewSlug));
        });
      });
    }
  }, [overviewSlug]);

  useEffect(() => {
    if (submit) {
      handleGetLocalForage((data) => {
        const currIndex = data.findIndex(
          (e) => e.name === currentCurrency.name
        );

        // Add
        if (formType === "add") {
          data[currIndex].assets.push(inputs);
        }

        // Edit
        if (formType === "edit") {
          const foundIndex = data[currIndex].assets.findIndex(
            (x) => x.id == currentItem.id
          );
          data[currIndex].assets[foundIndex] = inputs;
        }

        // Calculate totals
        data[currIndex].totals = totals(
          data[currIndex].assets,
          currentCurrency
        );

        handleSetLocalForage(data, () => {
          setCurrentSelectedCurrency(data[currIndex]);
          setCurrentItem({});
          setOpenAddAssetModal(false);
          resetInputs();
        });
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
      handleGetLocalForage((data) => {
        const currIndex = data.findIndex((e) => e.name === overviewSlug);
        data[currIndex].assets = data[currIndex].assets.filter(
          (item) => item.id !== asset.id
        );
        data[currIndex].totals = totals(
          data[currIndex].assets,
          currentCurrency
        );
        handleSetLocalForage(data, () => {
          setCurrentSelectedCurrency(data[currIndex]);
          setOpenRemoveAssetModal(false);
        });
      });
    },
    [overviewSlug]
  );

  const handleRemoveAllAssets = useCallback(
    (overviewSlug) => {
      handleGetLocalForage((data) => {
        const currIndex = data.findIndex((e) => e.name === overviewSlug);
        data[currIndex].assets = [];
        data[currIndex].totals = totals(
          data[currIndex].assets,
          currentCurrency
        );
        handleSetLocalForage(data, () => {
          setCurrentSelectedCurrency(data[currIndex]);
          setOpenRemoveAllAssetsModal(false);
        });
      });
    },
    [overviewSlug]
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
      <PageContainer className={"container mx-auto"}>
        <ButtonWrapper className={"mb-5"}>
          <Button id="link" to="/" text="Return to dashboard"></Button>
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
