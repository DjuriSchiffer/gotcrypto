// components/Detail.tsx

import React, { useState, ChangeEvent, useMemo, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Spinner } from 'flowbite-react';
import uniqueId from 'lodash.uniqueid';
import {
  currencyFormat,
  percentageFormat,
  formatDatePickerDate,
} from '../utils/calculateHelpers';
import { getImage } from '../utils/images';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import AddAssetForm from '../components/AddAssetForm';
import Page from '../components/Page';
import Table from '../components/Table';
import TableRow from '../components/TableRow';
import { Asset, SelectedCurrency } from '../types/currency';
import { useAppState } from '../hooks/useAppState';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';

const Detail: React.FC = () => {
  const { fetchedCurrencies } = useAppState();
  const {
    updateCurrency,
    selectedCurrencies,
    setSelectedCurrencies,
    loading: storageLoading,
  } = useStorage();
  const { slug: currentCurrencySlug } = useParams<{ slug: string }>();

  // Memoize the selected currency based on slug
  const selectedCurrency = useMemo(() => {
    const currency = selectedCurrencies.find(
      (currency) => currency.slug === currentCurrencySlug
    );
    return currency;
  }, [selectedCurrencies, currentCurrencySlug]);

  // Get the current fetched currency to obtain the latest price
  const currentFetchedCurrency = useMemo(() => {
    return fetchedCurrencies?.find(
      (element) => element.slug === currentCurrencySlug
    );
  }, [fetchedCurrencies, currentCurrencySlug]);

  // State for managing modals
  const [openAddAssetModal, setOpenAddAssetModal] = useState<boolean>(false);
  const [openEditAssetModal, setOpenEditAssetModal] = useState<boolean>(false);
  const [openRemoveAssetModal, setOpenRemoveAssetModal] =
    useState<boolean>(false);
  const [openRemoveAllAssetsModal, setOpenRemoveAllAssetsModal] =
    useState<boolean>(false);

  // State for managing form data
  const [formData, setFormData] = useState<{
    amount: string; // Changed to string
    purchasePrice: string;
    date: string;
  }>({
    amount: '',
    purchasePrice: '',
    date: formatDatePickerDate(new Date()),
  });

  // Current asset being edited or removed
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Handler for opening the Add Asset modal
  const handleOpenAddAssetModal = () => {
    setFormData({
      amount: '',
      purchasePrice: '',
      date: formatDatePickerDate(new Date()),
    });
    setCurrentAsset(null);
    setOpenAddAssetModal(true);
  };

  // Handler for opening the Edit Asset modal
  const handleOpenEditAssetModal = (asset: Asset) => {
    setFormData({
      amount: asset.amount,
      purchasePrice: asset.purchasePrice,
      date: asset.date,
    });
    setCurrentAsset(asset);
    setOpenEditAssetModal(true);
  };

  // Handler for opening the Remove Asset modal
  const handleOpenRemoveAssetModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setOpenRemoveAssetModal(true);
  };

  // Handler for opening the Remove All Assets modal
  const handleOpenRemoveAllAssetsModal = () => {
    setOpenRemoveAllAssetsModal(true);
  };

  // Handler for closing all modals
  const handleCloseModals = () => {
    setOpenAddAssetModal(false);
    setOpenEditAssetModal(false);
    setOpenRemoveAssetModal(false);
    setOpenRemoveAllAssetsModal(false);
    setCurrentAsset(null);
  };

  // Handler for form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for adding or editing an asset
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { amount, purchasePrice, date } = formData;

    // Basic validation
    if (!amount || !purchasePrice || !date) {
      alert('Please fill in all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    const parsedPurchasePrice = parseFloat(purchasePrice);

    if (isNaN(parsedAmount) || isNaN(parsedPurchasePrice)) {
      alert('Please enter valid numbers for amount and purchase price.');
      return;
    }

    const newAsset: Asset = {
      amount: parsedAmount.toString(),
      purchasePrice: parsedPurchasePrice.toFixed(2).toString(),
      date,
      id: currentAsset ? currentAsset.id : uniqueId(),
    };

    let updatedAssets: Asset[] = [];

    if (currentAsset && selectedCurrency) {
      // Editing an existing asset
      updatedAssets = selectedCurrency.assets.map((asset) =>
        asset.id === currentAsset.id ? newAsset : asset
      );
    } else if (selectedCurrency) {
      // Adding a new asset to an existing currency
      updatedAssets = [...selectedCurrency.assets, newAsset];
    } else if (currentFetchedCurrency) {
      // Adding a new asset to a new currency
      updatedAssets = [newAsset];
    } else {
      // Currency not found in fetchedCurrencies
      console.error('Current fetched currency not found.');
      return;
    }

    // Recalculate totals
    const updatedTotals = totals(updatedAssets);

    let updatedSelectedCurrency: SelectedCurrency;

    if (selectedCurrency) {
      // Update existing SelectedCurrency
      updatedSelectedCurrency = {
        ...selectedCurrency,
        assets: updatedAssets.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        totals: updatedTotals,
      };
    } else if (currentFetchedCurrency) {
      // Create new SelectedCurrency
      updatedSelectedCurrency = {
        name: currentFetchedCurrency.name,
        slug: currentFetchedCurrency.slug,
        cmc_id: currentFetchedCurrency.cmc_id,
        index: selectedCurrencies.length, // Assign index based on current length
        assets: updatedAssets,
        totals: updatedTotals,
      };
    } else {
      // This case should not occur due to earlier checks
      return;
    }

    // Optimistically update UI
    setSelectedCurrencies([...selectedCurrencies, updatedSelectedCurrency]);

    try {
      await updateCurrency(updatedSelectedCurrency);
    } catch (error) {
      // Revert UI changes
      setSelectedCurrencies(selectedCurrencies);
      // Notify user of the error
      alert('Failed to add asset. Please try again.');
    }

    // Close modals
    handleCloseModals();
  };

  // Handler for removing a single asset
  const handleRemoveAsset = async () => {
    if (!selectedCurrency || !currentAsset) return;

    const updatedAssets = selectedCurrency.assets.filter(
      (asset) => asset.id !== currentAsset.id
    );

    // Recalculate totals
    const updatedTotals = totals(updatedAssets);

    // Create updated SelectedCurrency
    const updatedSelectedCurrency: SelectedCurrency = {
      ...selectedCurrency,
      assets: updatedAssets,
      totals: updatedTotals,
    };

    // Update storage
    await updateCurrency(updatedSelectedCurrency);

    // Close modal
    handleCloseModals();
  };

  // Handler for removing all assets
  const handleRemoveAllAssets = async () => {
    if (!selectedCurrency) return;

    // Confirm action
    const confirmAction = window.confirm(
      `Are you sure you want to remove all assets for ${selectedCurrency.name}? This action cannot be undone.`
    );
    if (!confirmAction) return;

    // Clear assets
    const updatedSelectedCurrency: SelectedCurrency = {
      ...selectedCurrency,
      assets: [],
      totals: totals([]),
    };

    // Update storage
    await updateCurrency(updatedSelectedCurrency);

    // Close modal
    handleCloseModals();
  };

  // Loading state
  if (storageLoading) {
    return (
      <Page>
        <div className="text-white flex items-center">
          <Spinner color="success" aria-label="Loading saved data" />
          <span className="ml-2">Loading saved data...</span>
        </div>
      </Page>
    );
  }

  if (!fetchedCurrencies) {
    return (
      <Page>
        <div className="text-white flex items-center">
          <Spinner
            color="success"
            aria-label="Fetching data from Coinmarketcap"
          />
          <span className="ml-2">Fetching data from Coinmarketcap...</span>
        </div>
      </Page>
    );
  }

  // Handle case when currentFetchedCurrency is not found
  if (!currentFetchedCurrency) {
    return (
      <Page>
        <div className="text-white flex flex-col items-center justify-center h-screen">
          <p className="mb-4">Could not fetch data from Coinmarketcap....</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center p-3 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Icon className={'mr-2'} id="Left" color="white" />
            Return to dashboard
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="grid gap-4 mb-4 2xl:grid-cols-6">
        {/* Back to Dashboard Link */}
        <div className="col-span-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center p-3 mb-4 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Icon className="mr-2" id="Left" color="white" />
            Return to dashboard
          </Link>
        </div>
        <Card className="2xl:col-span-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                className="inline-block mr-4"
                width={48}
                height={48}
                src={getImage(currentFetchedCurrency.cmc_id)}
                alt={`${currentFetchedCurrency.name} icon`}
              />
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {currentFetchedCurrency.name}
                </h2>
                <p className="text-lg text-gray-400">
                  {currencyFormat(currentFetchedCurrency.price)} per unit
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleOpenAddAssetModal}>
                <Icon id="Plus" color="white" className="mr-1" />
                Add Asset
              </Button>
              {selectedCurrency && selectedCurrency.assets.length > 0 && (
                <Button
                  color="failure"
                  onClick={handleOpenRemoveAllAssetsModal}
                >
                  <Icon id="Remove" color="white" className="mr-1" />
                  Remove All Assets
                </Button>
              )}
            </div>
          </div>

          {/* Assets Table */}
          {selectedCurrency === undefined ||
          selectedCurrency?.assets.length === 0 ? (
            <div className="text-white flex items-center justify-center h-40">
              <span>No assets added yet.</span>
            </div>
          ) : (
            <Table type="overview">
              {selectedCurrency?.assets.map((asset: Asset) => (
                <TableRow
                  key={asset.id}
                  type="overview"
                  item={asset}
                  currencies={fetchedCurrencies}
                  currentCurrency={currentFetchedCurrency}
                >
                  <Button
                    size="sm"
                    onClick={() => handleOpenEditAssetModal(asset)}
                    className="mr-2"
                  >
                    <Icon id="Edit" color="white" />
                  </Button>
                  <Button
                    size="sm"
                    color="failure"
                    onClick={() => handleOpenRemoveAssetModal(asset)}
                  >
                    <Icon id="Remove" color="white" />
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

      {/* Add Asset Modal */}
      <Modal
        onClose={handleCloseModals}
        open={openAddAssetModal}
        title="Add Asset"
      >
        <AddAssetForm
          onSubmit={handleSubmit}
          amount={formData.amount}
          purchasePrice={formData.purchasePrice}
          date={formData.date}
          handleChange={handleChange}
          submitLabel="Add Asset"
        />
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        onClose={handleCloseModals}
        open={openEditAssetModal}
        title="Edit Asset"
      >
        <AddAssetForm
          onSubmit={handleSubmit}
          amount={formData.amount}
          purchasePrice={formData.purchasePrice}
          date={formData.date}
          handleChange={handleChange}
          submitLabel="Update Asset"
        />
      </Modal>

      {/* Remove Asset Confirmation Modal */}
      <Modal
        onClose={handleCloseModals}
        open={openRemoveAssetModal}
        title="Confirm Removal"
      >
        <div className="flex flex-col items-center">
          <Icon
            id="Warning"
            color="white"
            className="flex mx-auto mb-4 text-6xl"
          />
          <p className="mb-4">Are you sure you want to remove this asset?</p>
          <div className="flex space-x-2">
            <Button color="failure" onClick={handleRemoveAsset}>
              <Icon id="Remove" color="white" className="mr-1" />
              Remove Asset
            </Button>
            <Button onClick={handleCloseModals}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Remove All Assets Confirmation Modal */}
      <Modal
        onClose={handleCloseModals}
        open={openRemoveAllAssetsModal}
        title="Confirm Removal of All Assets"
      >
        <div className="flex flex-col items-center">
          <Icon
            id="Warning"
            color="white"
            className="flex mx-auto mb-4 text-6xl"
          />
          <p className="mb-4">
            Are you sure you want to remove all assets for{' '}
            {selectedCurrency?.name}?
          </p>
          <div className="flex space-x-2">
            <Button color="failure" onClick={handleRemoveAllAssets}>
              <Icon id="Remove" color="white" className="mr-1" />
              Remove All Assets
            </Button>
            <Button onClick={handleCloseModals}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default Detail;
