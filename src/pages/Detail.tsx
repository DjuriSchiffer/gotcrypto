import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from 'flowbite-react';
import uniqueId from 'lodash.uniqueid';
import Page from '../components/Page';
import { Asset, SelectedCurrency } from '../types/currency';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import { useAppState } from '../hooks/useAppState';
import { FaArrowLeft } from 'react-icons/fa';
import DetailHeader from '../components/DetailHeader';
import DetailModals from '../components/DetailModals';
import DetailAssetsTable from '../components/DetailAssetsTable';

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
            <DetailHeader
              currentFetchedCurrency={currentFetchedCurrency}
              selectedCurrency={selectedCurrency}
              currencyQuote={currencyQuote}
              onAddAsset={handleOpenAddAssetModal}
              onRemoveAllAssets={handleOpenRemoveAllAssetsModal}
            />

            <DetailAssetsTable
              selectedCurrency={selectedCurrency}
              fetchedCurrencies={fetchedCurrencies || []}
              currentFetchedCurrency={currentFetchedCurrency}
              currencyQuote={currencyQuote}
              onEditAsset={handleOpenEditAssetModal}
              onRemoveAsset={handleOpenRemoveAssetModal}
            />


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

        <DetailModals
          openAddAssetModal={openAddAssetModal}
          openEditAssetModal={openEditAssetModal}
          openRemoveAssetModal={openRemoveAssetModal}
          openRemoveAllAssetsModal={openRemoveAllAssetsModal}
          currentAsset={currentAsset}
          currencyQuote={currencyQuote}
          selectedCurrencyName={selectedCurrency?.name}
          onCloseModals={handleCloseModals}
          onFormSubmit={handleFormSubmit}
          onRemoveAsset={handleRemoveAsset}
          onRemoveAllAssets={handleRemoveAllAssets}
        />
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Detail;