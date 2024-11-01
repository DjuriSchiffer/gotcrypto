import React, { useState, ChangeEvent, useMemo, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Spinner } from 'flowbite-react';
import uniqueId from 'lodash.uniqueid';
import {
  currencyFormat,
} from '../utils/calculateHelpers';
import { getImage } from '../utils/images';
import Modal from '../components/Modal';
import AddAssetForm from '../components/AddAssetForm';
import Page from '../components/Page';
import Table from '../components/Table';
import TableRow from '../components/TableRow';
import { Asset, SelectedCurrency } from '../types/currency';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import { useAppState } from '../hooks/useAppState';
import { FaArrowLeft, FaExclamationTriangle, FaPen, FaPlus, FaTrashAlt } from 'react-icons/fa';

interface FormInputs {
  amount: string;
  purchasePrice: string;
  date: string;
}

const Detail: React.FC = () => {
  const { currencyQuote } = useAppState();
  const {
    data: fetchedCurrencies,
    isLoading: fetchedCurrenciesIsLoading,
    isError: fetchedCurrenciesIsError,
  } = useCoinMarketCap(currencyQuote);
  const {
    updateCurrency,
    selectedCurrencies,
    setSelectedCurrencies,
    loading: storageIsLoading,
  } = useStorage();
  const { slug: currentCurrencySlug } = useParams<{ slug: string }>();

  const [openAddAssetModal, setOpenAddAssetModal] = useState<boolean>(false);
  const [openEditAssetModal, setOpenEditAssetModal] = useState<boolean>(false);
  const [openRemoveAssetModal, setOpenRemoveAssetModal] = useState<boolean>(false);
  const [openRemoveAllAssetsModal, setOpenRemoveAllAssetsModal] = useState<boolean>(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Memoized selectors
  const selectedCurrency = useMemo(() => {
    return selectedCurrencies.find(
      (currency) => currency.slug === currentCurrencySlug
    );
  }, [selectedCurrencies, currentCurrencySlug]);

  const currentFetchedCurrency = useMemo(() => {
    return fetchedCurrencies?.find(
      (element) => element.slug === currentCurrencySlug
    );
  }, [fetchedCurrencies, currentCurrencySlug]);

  // Modal handlers
  const handleOpenAddAssetModal = () => {
    setCurrentAsset(null);
    setOpenAddAssetModal(true);
  };

  const handleOpenEditAssetModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setOpenEditAssetModal(true);
  };

  const handleOpenRemoveAssetModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setOpenRemoveAssetModal(true);
  };

  const handleOpenRemoveAllAssetsModal = () => {
    setOpenRemoveAllAssetsModal(true);
  };

  const handleCloseModals = () => {
    setOpenAddAssetModal(false);
    setOpenEditAssetModal(false);
    setOpenRemoveAssetModal(false);
    setOpenRemoveAllAssetsModal(false);
    setCurrentAsset(null);
  };

  const handleFormSubmit = async (formData: FormInputs) => {
    if (!selectedCurrency && !currentFetchedCurrency) {
      console.error('No currency selected or fetched');
      return;
    }

    try {
      const { amount, purchasePrice, date } = formData;

      // Create new asset object
      const newAsset: Asset = {
        amount: parseFloat(amount).toString(),
        purchasePrice: parseFloat(purchasePrice).toFixed(2),
        date,
        id: currentAsset?.id || uniqueId(),
      };

      let updatedSelectedCurrency: SelectedCurrency;

      if (selectedCurrency) {
        // Handle existing currency
        const updatedAssets = currentAsset
          ? selectedCurrency.assets.map((asset) =>
            asset.id === currentAsset.id ? newAsset : asset
          )
          : [...selectedCurrency.assets, newAsset];

        updatedSelectedCurrency = {
          ...selectedCurrency,
          assets: updatedAssets.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          totals: totals(updatedAssets),
        };
      } else if (currentFetchedCurrency) {
        // Handle new currency
        updatedSelectedCurrency = {
          name: currentFetchedCurrency.name,
          slug: currentFetchedCurrency.slug,
          cmc_id: currentFetchedCurrency.cmc_id,
          index: selectedCurrencies.length,
          assets: [newAsset],
          totals: totals([newAsset]),
        };
      } else {
        throw new Error('No currency context available');
      }

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to update asset:', error);
      alert('Failed to update asset. Please try again.');
    }
  };

  const handleRemoveAsset = async () => {
    if (!selectedCurrency || !currentAsset) return;

    try {
      const updatedAssets = selectedCurrency.assets.filter(
        (asset) => asset.id !== currentAsset.id
      );

      const updatedSelectedCurrency: SelectedCurrency = {
        ...selectedCurrency,
        assets: updatedAssets,
        totals: totals(updatedAssets),
      };

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to remove asset:', error);
      alert('Failed to remove asset. Please try again.');
    }
  };

  const handleRemoveAllAssets = async () => {
    if (!selectedCurrency) return;

    try {
      const updatedSelectedCurrency: SelectedCurrency = {
        ...selectedCurrency,
        assets: [],
        totals: totals([]),
      };

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to remove all assets:', error);
      alert('Failed to remove all assets. Please try again.');
    }
  };

  if (!currentFetchedCurrency) {
    return (
      <Page>
        <div className="text-white flex flex-col items-center justify-center h-screen">
          <p className="mb-4">Could not fetch data from Coinmarketcap....</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center p-3 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <FaArrowLeft className="mr-2" color="white" />
            Return to dashboard
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <LoadingErrorWrapper
      storageIsLoading={storageIsLoading}
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
    >
      <Page>
        <div className="grid gap-4 mb-4 2xl:grid-cols-6">
          <Card className="2xl:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  className="inline-block mr-4"
                  width={48}
                  height={48}
                  src={getImage(currentFetchedCurrency.cmc_id, 64)}
                  alt={`${currentFetchedCurrency.name} icon`}
                />
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {currentFetchedCurrency.name}
                  </h2>
                  <p className="text-lg text-gray-400">
                    {currencyFormat(currentFetchedCurrency.price, currencyQuote)} per unit
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleOpenAddAssetModal}>
                  <FaPlus color="white" className="mr-1" />
                  Add Asset
                </Button>
                {selectedCurrency && selectedCurrency.assets.length > 0 && (
                  <Button
                    color="failure"
                    onClick={handleOpenRemoveAllAssetsModal}
                  >
                    <FaTrashAlt color="white" className="mr-1" />
                    Remove All Assets
                  </Button>
                )}
              </div>
            </div>

            {/* Assets Table */}
            {selectedCurrency === undefined || selectedCurrency.assets.length === 0 ? (
              <div className="text-white flex items-center justify-center h-40">
                <span>No assets added yet.</span>
              </div>
            ) : (
              <Table type="overview">
                {selectedCurrency.assets.map((asset: Asset) => (
                  <TableRow
                    key={asset.id}
                    type="overview"
                    item={asset}
                    currencies={fetchedCurrencies || []}
                    currentCurrency={currentFetchedCurrency}
                    currencyQuote={currencyQuote}
                  >
                    <Button
                      size="sm"
                      onClick={() => handleOpenEditAssetModal(asset)}
                      className="mr-2"
                    >
                      <FaPen color="white" />
                    </Button>
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => handleOpenRemoveAssetModal(asset)}
                    >
                      <FaTrashAlt color="white" />
                    </Button>
                  </TableRow>
                ))}
                {/* Totals Row */}
                {/* <tr className="bg-gray-700">
                  <td className="px-6 py-4 font-semibold text-white">Totals</td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {currencyFormat(
                      selectedCurrency?.totals?.totalPurchasePrice || 0
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {currencyFormat(selectedCurrency?.totals?.totalValue || 0)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {percentageFormat(
                      selectedCurrency?.totals?.totalPercentageDifference || 0
                    )}
                    %
                  </td>
                </tr> */}
              </Table>
            )}
          </Card>
          {/* Overview Chart */}
          {selectedCurrency?.assets.length &&
            selectedCurrency.assets.length > 0 &&
            selectedCurrency.totals && (
              <Card className="2xl:col-span-6">
                {/* Assuming OverviewChart is a component that takes selectedCurrency as prop */}
                {/* <OverviewChart data={selectedCurrency} /> */}
              </Card>
            )}
        </div>

        <Modal
          onClose={handleCloseModals}
          open={openAddAssetModal}
          title="Add Asset"
        >
          <AddAssetForm
            key={`add-form-${openAddAssetModal}`}
            onSubmit={handleFormSubmit}
            submitLabel="Add Asset"
            currencyQuote={currencyQuote}
            isEdit={false}
          />
        </Modal>

        {/* Edit Asset Modal */}
        <Modal
          onClose={handleCloseModals}
          open={openEditAssetModal}
          title="Edit Asset"
        >
          <AddAssetForm
            key={`edit-form-${openEditAssetModal}-${currentAsset?.id}`}
            onSubmit={handleFormSubmit}
            defaultValues={currentAsset ? {
              amount: currentAsset.amount,
              purchasePrice: currentAsset.purchasePrice,
              date: currentAsset.date,
            } : undefined}
            submitLabel="Update Asset"
            currencyQuote={currencyQuote}
            isEdit={true}
          />
        </Modal>

        {/* Remove Asset Modal */}
        <Modal
          onClose={handleCloseModals}
          open={openRemoveAssetModal}
          title="Confirm Removal"
        >
          <div className="flex flex-col items-center">
            <FaExclamationTriangle
              color="white"
              className="flex mx-auto mb-4 text-6xl"
            />
            <p className="mb-4">Are you sure you want to remove this asset?</p>
            <div className="flex space-x-2">
              <Button color="failure" onClick={handleRemoveAsset}>
                <FaTrashAlt color="white" className="mr-1" />
                Remove Asset
              </Button>
              <Button onClick={handleCloseModals}>Cancel</Button>
            </div>
          </div>
        </Modal>

        {/* Remove All Assets Modal */}
        <Modal
          onClose={handleCloseModals}
          open={openRemoveAllAssetsModal}
          title="Confirm Removal of All Assets"
        >
          <div className="flex flex-col items-center">
            <FaExclamationTriangle
              color="white"
              className="flex mx-auto mb-4 text-6xl"
            />
            <p className="mb-4">
              Are you sure you want to remove all assets for{' '}
              {selectedCurrency?.name}?
            </p>
            <div className="flex space-x-2">
              <Button color="failure" onClick={handleRemoveAllAssets}>
                <FaTrashAlt color="white" className="mr-1" />
                Remove All Assets
              </Button>
              <Button onClick={handleCloseModals}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Detail;