import { Card } from 'flowbite-react';
import uniqueId from 'lodash.uniqueid';
import { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

import type { SelectedAsset, Transaction, TransactionType, TransferType } from '../types/currency';

import DetailHeader from '../components/DetailHeader';
import DetailModals from '../components/DetailModals';
import DetailCharts from '../components/DetailsCharts';
import DetailTransactionTable from '../components/DetailTransactionTable';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';

type FormInputs = {
  amount: string;
  date: string;
  description?: string
  excludeForTax?: boolean
  purchasePrice: string;
  transactionType: TransactionType;
  transferType?: TransferType,
}

function Detail() {
  const { currencyQuote } = useAppState();
  const {
    data: fetchedCurrencies,
    isError: fetchedCurrenciesIsError,
    isLoading: fetchedCurrenciesIsLoading,
  } = useCoinMarketCap(currencyQuote);
  const {
    loading: storageIsLoading,
    selectedCurrencies,
    updateCurrency,
  } = useStorage();
  const { slug: currentAssetSlug } = useParams<{ slug: string }>();

  const [openAddTransactionModal, setOpenAddTransactionModal] = useState<boolean>(false);
  const [openEditTransactionModal, setOpenEditTransactionModal] = useState<boolean>(false);
  const [openRemoveTransactionModal, setOpenRemoveTransactionModal] = useState<boolean>(false);
  const [openRemoveAllTransactionsModal, setOpenRemoveAllTransactionsModal] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<null | Transaction>(null);

  const selectedAsset = useMemo(() => {
    return selectedCurrencies.find(
      (currency) => currency.slug === currentAssetSlug
    );
  }, [selectedCurrencies, currentAssetSlug]);

  const currentFetchedCurrency = useMemo(() => {
    return fetchedCurrencies?.find(
      (element) => element.slug === currentAssetSlug
    );
  }, [fetchedCurrencies, currentAssetSlug]);

  const handleOpenAddTransactionModal = () => {
    setCurrentTransaction(null);
    setOpenAddTransactionModal(true);
  };

  const handleOpenEditTransactionModal = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setOpenEditTransactionModal(true);
  };

  const handleOpenRemoveTransactionModal = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setOpenRemoveTransactionModal(true);
  };

  const handleOpenRemoveAllTransactionsModal = () => {
    setOpenRemoveAllTransactionsModal(true);
  };

  const handleCloseModals = () => {
    setOpenAddTransactionModal(false);
    setOpenEditTransactionModal(false);
    setOpenRemoveTransactionModal(false);
    setOpenRemoveAllTransactionsModal(false);
    setCurrentTransaction(null);
  };

  const handleFormSubmit = async (formData: FormInputs) => {
    if (!selectedAsset && !currentFetchedCurrency) {
      console.error('No currency selected or fetched');
      return;
    }

    try {
      const { amount, date, description, excludeForTax, purchasePrice, transactionType, transferType } = formData;

      const normalizedPrice = purchasePrice.toString().replace(',', '.');
      const parsedPrice = parseFloat(normalizedPrice);
      const formattedPrice = Math.abs(parsedPrice).toFixed(2);

      const normalizedAmount = amount.toString().replace(',', '.');
      const parsedAmount = parseFloat(normalizedAmount);
      const formattedAmount = Math.abs(parsedAmount).toString();

      const newTransaction: Transaction = {
        amount: formattedAmount,
        date,
        description: description ?? '',
        excludeForTax: excludeForTax ?? false,
        id: currentTransaction?.id ?? uniqueId(`trans_${Date.now()}_`),
        purchasePrice: formattedPrice,
        type: transactionType,
        ...(transactionType === 'transfer' ? { transferType: transferType ?? 'in' } : {})
      };

      let updatedSelectedCurrency: SelectedAsset;

      if (selectedAsset) {
        const updatedTransactions = currentTransaction
          ? selectedAsset.transactions.map((transaction) =>
            transaction.id === currentTransaction.id ? newTransaction : transaction
          )
          : [...selectedAsset.transactions, newTransaction];

        updatedSelectedCurrency = {
          ...selectedAsset,
          totals: totals(updatedTransactions),
          transactions: updatedTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        };
      } else if (currentFetchedCurrency) {
        updatedSelectedCurrency = {
          cmc_id: currentFetchedCurrency.cmc_id,
          index: selectedCurrencies.length,
          name: currentFetchedCurrency.name,
          slug: currentFetchedCurrency.slug,
          totals: totals([newTransaction]),
          transactions: [newTransaction],
        };
      } else {
        throw new Error('No currency context available');
      }

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  };

  const handleRemoveTransaction = async () => {
    if (!selectedAsset || !currentTransaction) return;

    try {
      const updatedTransactions = selectedAsset.transactions.filter(
        (transaction) => transaction.id !== currentTransaction.id
      );

      const updatedSelectedCurrency: SelectedAsset = {
        ...selectedAsset,
        totals: totals(updatedTransactions),
        transactions: updatedTransactions,
      };

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to remove transaction:', error);
      alert('Failed to remove transaction. Please try again.');
    }
  };

  const handleRemoveAllTransactions = async () => {
    if (!selectedAsset) return;

    try {
      const updatedSelectedCurrency: SelectedAsset = {
        ...selectedAsset,
        totals: totals([]),
        transactions: [],
      };

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to remove all transactions:', error);
      alert('Failed to remove all transactions. Please try again.');
    }
  };

  const handleAddTransactionClick = () => {
    handleOpenAddTransactionModal();
  };

  const handleRemoveAllTransactionsClick = () => {
    handleOpenRemoveAllTransactionsModal();
  };

  const handleRemoveAllTransactionsCallback = () => {
    void handleRemoveAllTransactions();
  };

  const handleFormSubmitCallback = (formData: FormInputs) => {
    void handleFormSubmit(formData);
  };

  const handleRemoveTransactionCallback = () => {
    void handleRemoveTransaction();
  };

  if (!currentFetchedCurrency) {
    return (
      <Page>
        <div className="text-white flex flex-col items-center justify-center h-screen">
          <p className="mb-4">Could not fetch data from Coinmarketcap....</p>
          <Link
            className="inline-flex items-center justify-center p-3 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            to="/"
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
      fetchedIsLoading={fetchedCurrenciesIsLoading}
      isError={fetchedCurrenciesIsError}
      storageIsLoading={storageIsLoading}
    >
      <Page>
        <div className="grid gap-4 mb-4 w-full mt-14 lg:mt-auto">
          <div className='grid grid-cols-1 gap-4 mb-4'>
            <Card>
              <DetailHeader
                currencyQuote={currencyQuote}
                currentFetchedCurrency={currentFetchedCurrency}
                onAddTransaction={handleAddTransactionClick}
                onRemoveAllTransactions={handleRemoveAllTransactionsClick}
                selectedAsset={selectedAsset}
              />
              <DetailTransactionTable
                currencyQuote={currencyQuote}
                currentFetchedCurrency={currentFetchedCurrency}
                fetchedCurrencies={fetchedCurrencies ?? []}
                onEditTransaction={handleOpenEditTransactionModal}
                onRemoveTransaction={handleOpenRemoveTransactionModal}
                selectedAsset={selectedAsset}
              />
            </Card>
            {selectedAsset && selectedAsset.transactions.length > 0 &&
              <Card>
                <DetailCharts currencyQuote={currencyQuote} selectedAsset={selectedAsset} />
              </Card>}

          </div>

          <DetailModals
            currencyQuote={currencyQuote}
            currentTransaction={currentTransaction}
            onCloseModals={handleCloseModals}
            onFormSubmit={handleFormSubmitCallback}
            onRemoveAllTransactions={handleRemoveAllTransactionsCallback}
            onRemoveTransaction={handleRemoveTransactionCallback}
            openAddTransactionModal={openAddTransactionModal}
            openEditTransactionModal={openEditTransactionModal}
            openRemoveAllTransactionsModal={openRemoveAllTransactionsModal}
            openRemoveTransactionModal={openRemoveTransactionModal}
            selectedAssetName={selectedAsset?.name}
          />
        </div>
      </Page>
    </LoadingErrorWrapper>
  );
}

export default Detail;