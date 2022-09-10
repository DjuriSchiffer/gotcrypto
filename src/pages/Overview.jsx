import { useEffect, useState, useCallback } from "react";
import { useState as useGlobalState } from "../hooks/useReducer";
import AddAssetForm from "../components/AddAssetForm";
import { useDispatch } from "../hooks/useReducer";
import localForage from "localforage";
import { useParams } from "react-router-dom";
import totals from "../utils/totals";
import uniqueId from "lodash.uniqueid";
import { CurrencyFormat } from "../utils/CalculateHelpers";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Table from "../components/Table";
import TableHead from "../components/TableHead";
import TableBody from "../components/TableBody";
import TableRow from "../components/TableRow";
import Modal from "../components/Modal";

const Overview = () => {
  const { currencies } = useGlobalState();
  const dispatch = useDispatch();
  const { overviewSlug } = useParams();
  const [currentCurrency, setCurrentCurrency] = useState({});
  const [currentSelectedCurrency, setCurrentSelectedCurrency] = useState({});
  const [inputs, setInputs] = useState({});
  const [submit, setSubmit] = useState(false);
  const [openAddAssetModal, setOpenAddAssetModal] = useState(false);
  const [openRemoveAssetModal, setRemoveAssetModal] = useState(false);
  const [openRemoveAllAssetsModal, setOpenRemoveAllAssetsModal] =
    useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const setSelectedCurrencyData = (data, currIndex) => {
    localForage
      .setItem("selectedCurrencies", data)
      .then((data) => {
        dispatch({
          type: "SET_SELECTED_CURRENCIES",
          payload: data,
        });
        setCurrentSelectedCurrency(data[currIndex]);
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
      localForage
        .getItem("selectedCurrencies")
        .then((data) => {
          setCurrentSelectedCurrency(data.find((e) => e.name === overviewSlug));
        })
        .catch(function (err) {
          console.log(err);
          // This code runs if there were any errors
          dispatch({ type: "SET_ERROR" });
        });
    }
  }, [overviewSlug]);

  useEffect(() => {
    if (submit) {
      localForage
        .getItem("selectedCurrencies")
        .then((data) => {
          const currIndex = data.findIndex(
            (e) => e.name === currentCurrency.name
          );
          data[currIndex].assets.push(inputs);
          data[currIndex].totals = totals(
            data[currIndex].assets,
            currentCurrency
          );
          setSelectedCurrencyData(data, currIndex);
          setOpenAddAssetModal(false);
        })
        .catch(function (err) {
          console.log(err);
          // This code runs if there were any errors
          dispatch({ type: "SET_ERROR" });
        });
    }
    setSubmit(false);
  }, [submit, inputs, currentCurrency]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setInputs((values) => ({
      ...values,
      [name]: name === "date" ? new Date(value) : value,
      id: uniqueId(),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
    event.target.reset();
  };

  const handleRemoveAsset = useCallback(
    (asset) => {
      localForage.getItem("selectedCurrencies").then((data) => {
        const currIndex = data.findIndex((e) => e.name === overviewSlug);

        data[currIndex].assets = data[currIndex].assets.filter(
          (item) => item.id !== asset.id
        );
        data[currIndex].totals = totals(
          data[currIndex].assets,
          currentCurrency
        );
        setSelectedCurrencyData(data, currIndex);
        setRemoveAssetModal(false);
      });
    },
    [overviewSlug]
  );

  const handleRemoveAllAssets = useCallback(
    (overviewSlug) => {
      localForage.getItem("selectedCurrencies").then((data) => {
        const currIndex = data.findIndex((e) => e.name === overviewSlug);
        data[currIndex].assets = [];
        data[currIndex].totals = totals(
          data[currIndex].assets,
          currentCurrency
        );
        setSelectedCurrencyData(data, currIndex);
        setOpenRemoveAllAssetsModal(false);
      });
    },
    [overviewSlug]
  );

  const handleOpenRemoveAssetModal = (item) => {
    setCurrentItem(item);
    setRemoveAssetModal(true);
  };

  return (
    <div className="bg-gray-dark p-8 min-h-screen">
      <div className="container mx-auto">
        <div className="mb-5">
          <Button id="link" to="/" text="Return to dashboard"></Button>
        </div>
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
            <div className="flex">
              <Button
                id="action"
                onClick={() => setOpenAddAssetModal(true)}
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
            </div>
          </div>
        )}
      </div>
      <Table className={"container mx-auto bg-gray-dark shadow-line p-8 m-10"}>
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
      <Modal
        onClose={() => setOpenAddAssetModal(false)}
        open={openAddAssetModal}
        title={"Add asset"}
      >
        <AddAssetForm onSubmit={handleSubmit} className={"flex flex-col"}>
          <input
            className="text-black mb-2 p-2 shadow-line rounded"
            name="amount"
            type="number"
            placeholder="amount"
            onChange={handleChange}
            required
          />
          <input
            className="text-black mb-2 p-2 shadow-line rounded"
            name="purchasePrice"
            type="number"
            placeholder="purchase price"
            onChange={handleChange}
            required
          />
          <input
            className="text-black mb-2 p-2 shadow-line rounded"
            name="date"
            type="date"
            placeholder="date"
            onChange={handleChange}
            required
          />
          <input
            className="bg-green p-2 rounded-md"
            type="submit"
            value="add asset"
          />
        </AddAssetForm>
      </Modal>
      <Modal
        onClose={() => setRemoveAssetModal(false)}
        open={openRemoveAssetModal}
        title={"Are you sure you want to remove this asset?"}
      >
        <Button
          id="action"
          onClick={() => handleRemoveAsset(currentItem)}
          className="p-2 rounded-md text-white flex items-center bg-red"
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
        <Button
          id="action"
          onClick={() => handleRemoveAllAssets(overviewSlug)}
          className="p-2 rounded-md text-white flex items-center bg-red"
          text="Remove all assets"
        >
          <Icon id="Remove" color="white" />
        </Button>
      </Modal>
    </div>
  );
};

export default Overview;
