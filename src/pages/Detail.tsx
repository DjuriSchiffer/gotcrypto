import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
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
import { Asset, SelectedCurrency } from '../types/store';
import { FetchedCurrency } from '../types/currency';

const Detail: React.FC = () => {
  const { fetchedCurrencies, selectedCurrencies } = useAppState();
  const { setLocalForage } = useLocalForage();
  const { slug } = useParams();

  const [currentCurrency, setCurrentCurrency] =
    useState<FetchedCurrency | null>(null);
  const [currentSelectedCurrency, setCurrentSelectedCurrency] =
    useState<SelectedCurrency | null>(null);
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

  useEffect(() => {
    if (fetchedCurrencies !== null && slug) {
      const currIndex = Object.values(fetchedCurrencies).findIndex(
        (e) => e.slug === slug
      );
      if (currIndex !== -1) {
        setCurrentCurrency(Object.values(fetchedCurrencies)[currIndex]);
      } else {
        setCurrentCurrency(null);
      }
    }
  }, [fetchedCurrencies, selectedCurrencies, slug]);

  useEffect(() => {
    if (slug && selectedCurrencies) {
      const selected = selectedCurrencies.find((e) => e.slug === slug) || null;
      setCurrentSelectedCurrency(selected);
    }
  }, [selectedCurrencies, slug]);

  useEffect(() => {
    if (submit && currentCurrency && fetchedCurrencies) {
      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === currentCurrency.name
      );
      if (currIndex === -1) return;

      let updatedInputs = { ...inputs };
      updatedInputs.purchasePrice = updatedInputs.purchasePrice.replace(
        ',',
        '.'
      );

      let updatedSelectedCurrencies = [...selectedCurrencies];

      if (formType === 'add') {
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
        const foundIndex = updatedSelectedCurrencies[
          currIndex
        ].assets.findIndex((x) => x.id === currentItem.id);
        if (foundIndex !== -1) {
          const editedAsset: Asset = {
            ...updatedInputs,
            amount: updatedInputs.amount,
            purchasePrice: updatedInputs.purchasePrice,
            date: updatedInputs.date,
            id: currentItem.id,
          };
          updatedSelectedCurrencies[currIndex].assets[foundIndex] = editedAsset;
        }
      }

      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets
      );

      updatedSelectedCurrencies[currIndex].assets.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setCurrentItem(null);
        setOpenAddAssetModal(false);
        resetInputs();
      });

      setSubmit(false);
    }
  }, [
    submit,
    inputs,
    currentCurrency,
    formType,
    currentItem,
    selectedCurrencies,
    fetchedCurrencies,
    setLocalForage,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof typeof inputs;
    let value = e.target.value;

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
      if (!slug) return;

      const currIndex = selectedCurrencies.findIndex((e) => e.name === slug);
      if (currIndex === -1) return;

      const updatedSelectedCurrencies = [...selectedCurrencies];
      updatedSelectedCurrencies[currIndex].assets = updatedSelectedCurrencies[
        currIndex
      ].assets.filter((item) => item.id !== asset.id);

      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets
      );

      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setOpenRemoveAssetModal(false);
      });
    },
    [slug, selectedCurrencies, setLocalForage, currentCurrency]
  );

  const handleRemoveAllAssets = useCallback(
    (slugParam?: string) => {
      if (!slugParam) return;

      const currIndex = selectedCurrencies.findIndex(
        (e) => e.name === slugParam
      );
      if (currIndex === -1) return;

      const updatedSelectedCurrencies = [...selectedCurrencies];
      updatedSelectedCurrencies[currIndex].assets = [];
      updatedSelectedCurrencies[currIndex].totals = totals(
        updatedSelectedCurrencies[currIndex].assets
      );

      setLocalForage('selectedCurrencies', updatedSelectedCurrencies, () => {
        setCurrentSelectedCurrency(updatedSelectedCurrencies[currIndex]);
        setOpenRemoveAllAssetsModal(false);
      });
    },
    [slug, selectedCurrencies, setLocalForage, currentCurrency]
  );

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

  const handleOpenRemoveAssetModal = (item: Asset) => {
    setCurrentItem(item);
    setOpenRemoveAssetModal(true);
  };

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
      {fetchedCurrencies && currentCurrency && currentSelectedCurrency ? (
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
                currentSelectedCurrency.assets.map((asset: Asset) => {
                  return (
                    <TableRow
                      key={asset.id}
                      type="overview"
                      item={asset}
                      currentCurrency={currentCurrency}
                      currencies={fetchedCurrencies}
                    >
                      <Button
                        id="action"
                        onClick={() => handleOpenAddAssetModal('edit', asset)}
                      >
                        <Icon id="Edit" color="white" />
                      </Button>
                      <Button
                        onClick={() => handleOpenRemoveAssetModal(asset)}
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
                    currencies={fetchedCurrencies}
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
          <Button onClick={() => handleRemoveAllAssets(slug)} color={'failure'}>
            <Icon id="Remove" color="white" className={'mr-1'} />
            Remove all assets
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default Detail;
