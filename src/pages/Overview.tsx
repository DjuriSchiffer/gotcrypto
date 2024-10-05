// src/pages/Overview.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useAppState } from '../hooks/useReducer';
import AddAssetForm from '../components/AddAssetForm';
import { useLocalForage } from '../hooks/useLocalForage';
import { useParams, Link } from 'react-router-dom';
import totals from '../utils/totals';
import uniqueId from 'lodash.uniqueid';
import {
  currencyFormat,
  formatDatePickerDate,
} from '../utils/calculateHelpers';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Page from '../components/Page';
import OverviewChart from '../components/ChartsOverview';
import { getImage } from '../utils/images';
import { Card, Button, Spinner } from 'flowbite-react';
import Table from '../components/Table';
import TableRow from '../components/TableRow';
import { Currency, Asset } from '../types/store';

const Overview: React.FC = () => {
  const { currencies, selectedCurrencies } = useAppState();
  const { setLocalForage } = useLocalForage();
  const { overviewSlug } = useParams();

  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [currentSelectedCurrency, setCurrentSelectedCurrency] =
    useState<Currency | null>(null);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [inputs, setInputs] = useState<{
    amount: string;
    purchasePrice: string;
    date: string;
    id: string;
  }>({
    amount: '',
    purchasePrice: '',
    date: formatDatePickerDate(new Date()),
    id: uniqueId(),
  });
  const [submit, setSubmit] = useState<boolean>(false);
  const [openAddAssetModal, setOpenAddAssetModal] = useState<boolean>(false);
  const [openRemoveAssetModal, setOpenRemoveAssetModal] =
    useState<boolean>(false);
  const [openRemoveAllAssetsModal, setOpenRemoveAllAssetsModal] =
    useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Asset | null>(null);

  // Effect to set currentCurrency based on overviewSlug
  useEffect(() => {
    if (currencies !== null && overviewSlug) {
      const currIndex = Object.values(currencies).findIndex(
        (e) => e.slug === overviewSlug
      );
      if (currIndex !== -1) {
        setCurrentCurrency(Object.values(currencies)[currIndex]);
      } else {
        setCurrentCurrency(null);
      }
    }
  }, [currencies, overviewSlug]);

  // Effect to set currentSelectedCurrency based on overviewSlug
  useEffect(() => {
    if (overviewSlug && selectedCurrencies) {
      const selected =
        selectedCurrencies.find((e) => e.slug === overviewSlug) || null;
      setCurrentSelectedCurrency(selected);
    }
  }, [selectedCurrencies, overviewSlug]);

  // Effect to handle form submission
  useEffect(() => {
    if (submit && currentCurrency && currencies) {
      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === currentCurrency.name
      );
      if (currIndex === -1) return; // Currency not found

      // Clone inputs and replace comma with dot in purchasePrice
      let updatedInputs = { ...inputs };
      updatedInputs.purchasePrice = updatedInputs.purchasePrice.replace(
        ',',
        '.'
      );

      // Clone selectedCurrencies to avoid direct mutation
      let updatedSelectedCurrencies = [...selectedCurrencies];

      if (formType === 'add') {
        // Add new asset
        const newAsset: Asset = {
          ...updatedInputs,
          amount: updatedInputs.amount,
          purchasePrice: updatedInputs.purchasePrice,
          date: updatedInputs.date,
          id: updatedInputs.id,
        };
        updatedSelectedCurrencies[currIndex].assets.push(newAsset);
      }

      if (formType === 'edit' && currentItem) {
        // Edit existing asset
        const foundIndex = updatedSelectedCurrencies[
          currIndex
        ].assets.findIndex((x) => x.id === currentItem.id);
        if (foundIndex !== -1) {
          const editedAsset: Asset = {
            ...updatedInputs,
            amount: updatedInputs.amount,
            purchasePrice: updatedInputs.purchasePrice,
            date: updatedInputs.date,
            id: currentItem.id, // Ensure ID remains the same
          };
          updatedSelectedCurrencies[currIndex].assets[foundIndex] = editedAsset;
        }
      }

      // Recalculate totals
      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets,
        currentCurrency
      );

      // Sort assets by date descending
      updatedSelectedCurrencies[currIndex].assets.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Save updated selectedCurrencies to localForage
      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setCurrentItem(null);
        setOpenAddAssetModal(false);
        resetInputs();
      });

      // Reset submit state
      setSubmit(false);
    }
  }, [
    submit,
    inputs,
    currentCurrency,
    formType,
    currentItem,
    selectedCurrencies,
    currencies,
    setLocalForage,
  ]);

  // Handle input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof typeof inputs;
    let value = event.target.value;

    if (name === 'purchasePrice') {
      if (isNaN(Number(value)) || value.includes(',')) {
        if (value.includes(',')) {
          value = value.replace(',', '.');
        } else {
          return;
        }
      }
    }

    setInputs((prev) => ({
      ...prev,
      [name]: name === 'id' ? currentItem?.id || uniqueId() : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmit(true);
    event.currentTarget.reset();
  };

  const handleRemoveAsset = useCallback(
    (asset: Asset) => {
      if (!overviewSlug) return;

      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === overviewSlug
      );
      if (currIndex === -1) return;

      const updatedSelectedCurrencies = [...selectedCurrencies];
      updatedSelectedCurrencies[currIndex].assets = updatedSelectedCurrencies[
        currIndex
      ].assets.filter((item) => item.id !== asset.id);

      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets,
        currentCurrency
      );

      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setOpenRemoveAssetModal(false);
      });
    },
    [overviewSlug, selectedCurrencies, setLocalForage, currentCurrency]
  );

  const handleRemoveAllAssets = useCallback(
    (overviewSlugParam?: string) => {
      if (!overviewSlugParam) return;

      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === overviewSlugParam
      );
      if (currIndex === -1) return;

      // Clone selectedCurrencies to avoid direct mutation
      const updatedSelectedCurrencies = [...selectedCurrencies];
      updatedSelectedCurrencies[currIndex].assets = [];
      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets,
        currentCurrency
      );

      // Save updated selectedCurrencies to localForage
      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setOpenRemoveAllAssetsModal(false);
      });
    },
    [overviewSlug, selectedCurrencies, setLocalForage, currentCurrency]
  );

  // Handle opening the add/edit asset modal
  const handleOpenAddAssetModal = (type: 'add' | 'edit', item?: Asset) => {
    setFormType(type);
    if (type === 'add') {
      resetInputs();
    }
    if (type === 'edit' && item) {
      setCurrentItem(item);
      setInputs({
        amount: item.amount,
        purchasePrice: item.purchasePrice,
        date: item.date,
        id: item.id,
      });
    }
    setOpenAddAssetModal(true);
  };

  // Handle opening the remove asset modal
  const handleOpenRemoveAssetModal = (item: Asset) => {
    setCurrentItem(item);
    setOpenRemoveAssetModal(true);
  };

  // Reset input fields
  const resetInputs = () => {
    setInputs({
      amount: '',
      purchasePrice: '',
      date: formatDatePickerDate(new Date()),
      id: uniqueId(),
    });
  };

  return (
    <Page>
      {currencies && currentCurrency && currentSelectedCurrency ? (
        <div className={'grid gap-4 2xl:grid-cols-6 mb-4'}>
          <div>
            <Link
              to={'/'}
              className={
                'mb-4 inline-flex items-center justify-center p-5 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'
              }
            >
              <Icon className={'mr-1'} id="Left" color="white" />
              Return to dashboard
            </Link>
          </div>

          <Card className={'2xl:col-span-5'}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl flex mb-1 items-center text-white">
                  <img
                    className="inline-block mr-2"
                    width={32}
                    height={32}
                    src={getImage(currentCurrency.cmc_id)}
                    alt={`${currentCurrency.name} icon`}
                  />
                  {currentCurrency.slug}
                </div>
                <div className="text-xl text-white">
                  {currencyFormat(currentCurrency.price)}
                  <span className="text-sm ml-1">current price</span>
                </div>
              </div>
              <div className={'ml-auto flex'}>
                <Button
                  onClick={() => handleOpenAddAssetModal('add')}
                  className={'mr-2'}
                >
                  Add Asset
                  <Icon id="Plus" color="white" className={'ml-1'} />
                </Button>
                <Button
                  onClick={() => setOpenRemoveAllAssetsModal(true)}
                  color={'failure'}
                >
                  Remove all assets
                  <Icon id="Remove" color="white" className={'ml-1'} />
                </Button>
              </div>
            </div>

            <Table type={'overview'}>
              {currentSelectedCurrency.assets.length > 0 &&
                currentSelectedCurrency.assets.map((item: Asset) => {
                  return (
                    <TableRow
                      key={item.id}
                      type="overview"
                      item={item}
                      currentCurrency={currentCurrency}
                      currencies={currencies}
                    >
                      <Button
                        id="action"
                        onClick={() => handleOpenAddAssetModal('edit', item)}
                      >
                        <Icon id="Edit" color="white" />
                      </Button>
                      <Button
                        onClick={() => handleOpenRemoveAssetModal(item)}
                        color={'failure'}
                        className={'ml-2'}
                      >
                        <Icon id="Remove" color="white" />
                      </Button>
                    </TableRow>
                  );
                })}
              {currentSelectedCurrency.assets.length > 0 &&
                currentSelectedCurrency.totals && (
                  <TableRow
                    type="overview-totals"
                    item={currentSelectedCurrency.totals}
                    currentCurrency={currentCurrency}
                    currencies={currencies}
                  />
                )}
            </Table>
          </Card>

          {currentSelectedCurrency.assets.length > 0 &&
            currentSelectedCurrency.totals && (
              <Card className={'2xl:col-start-2 2xl:col-span-5'}>
                <OverviewChart data={currentSelectedCurrency} />
              </Card>
            )}
        </div>
      ) : (
        <div className={'text-white flex items-center'}>
          <Spinner
            color="success"
            aria-label="Fetching data from Coinmarketcap"
          />
          <span className={'ml-2'}>Fetching data from Coinmarketcap...</span>
        </div>
      )}

      <Modal
        onClose={() => setOpenAddAssetModal(false)}
        open={openAddAssetModal}
        title={formType === 'add' ? 'Add asset' : 'Edit asset'}
      >
        <AddAssetForm
          onSubmit={handleSubmit}
          className={'flex flex-col'}
          amount={inputs.amount}
          price={inputs.purchasePrice}
          date={inputs.date}
          id={inputs.id}
          handleChange={handleChange}
          formType={formType}
        />
      </Modal>

      <Modal
        onClose={() => setOpenRemoveAssetModal(false)}
        open={openRemoveAssetModal}
        title={'Are you sure you want to remove this asset?'}
      >
        <Icon
          id="Warning"
          color="white"
          className="flex mx-auto mb-4 text-6xl"
        />
        <div className="flex justify-center">
          <Button
            color={'failure'}
            onClick={() => {
              if (currentItem) {
                handleRemoveAsset(currentItem);
              }
            }}
          >
            <Icon id="Remove" color="white" />
            Remove asset
          </Button>
        </div>
      </Modal>

      {/* Remove All Assets Modal */}
      <Modal
        onClose={() => setOpenRemoveAllAssetsModal(false)}
        open={openRemoveAllAssetsModal}
        title={'Are you sure you want to remove all assets?'}
      >
        <Icon
          id="Warning"
          color="white"
          className="flex mx-auto mb-4 text-6xl"
        />
        <div className="flex justify-center">
          <Button
            onClick={() => handleRemoveAllAssets(overviewSlug)}
            color={'failure'}
          >
            <Icon id="Remove" color="white" className={'mr-1'} />
            Remove all assets
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default Overview;
