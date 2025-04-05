import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from 'flowbite-react';
import uniqueId from 'lodash.uniqueid';
import Page from '../components/Page';
import { Transaction, SelectedAsset, TransactionType, TransferType } from '../types/currency';
import { useStorage } from '../hooks/useStorage';
import totals from '../utils/totals';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import { useAppState } from '../hooks/useAppState';
import { FaArrowLeft } from 'react-icons/fa';
import DetailHeader from '../components/DetailHeader';
import DetailModals from '../components/DetailModals';
import DetailCharts from '../components/DetailsCharts';
import DetailTransactionTable from '../components/DetailTransactionTable';

interface FormInputs {
  amount: string;
  purchasePrice: string;
  date: string;
  transactionType: TransactionType;
  transferType?: TransferType,
  description?: string
  excludeForTax?: boolean
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
    loading: storageIsLoading,
  } = useStorage();
  const { slug: currentAssetSlug } = useParams<{ slug: string }>();

  const [openAddTransactionModal, setOpenAddTransactionModal] = useState<boolean>(false);
  const [openEditTransactionModal, setOpenEditTransactionModal] = useState<boolean>(false);
  const [openRemoveTransactionModal, setOpenRemoveTransactionModal] = useState<boolean>(false);
  const [openRemoveAllTransactionsModal, setOpenRemoveAllTransactionsModal] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

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
      const { amount, purchasePrice, date, transactionType, transferType, description, excludeForTax } = formData;

      let normalizedPrice = purchasePrice.toString().replace(',', '.');
      const parsedPrice = parseFloat(normalizedPrice);
      const formattedPrice = Math.abs(parsedPrice).toFixed(2);

      const normalizedAmount = amount.toString().replace(',', '.');
      const parsedAmount = parseFloat(normalizedAmount);
      const formattedAmount = Math.abs(parsedAmount).toString();

      const newTransaction: Transaction = {
        amount: formattedAmount,
        purchasePrice: formattedPrice,
        date,
        id: currentTransaction?.id || uniqueId(`trans_${Date.now()}_`),
        type: transactionType,
        description: description || '',
        excludeForTax: excludeForTax || false,
        ...(transactionType === 'transfer' ? { transferType: transferType || 'in' } : {})
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
          transactions: updatedTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          totals: totals(updatedTransactions),
        };
      } else if (currentFetchedCurrency) {
        updatedSelectedCurrency = {
          name: currentFetchedCurrency.name,
          slug: currentFetchedCurrency.slug,
          cmc_id: currentFetchedCurrency.cmc_id,
          index: selectedCurrencies.length,
          transactions: [newTransaction],
          totals: totals([newTransaction]),
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
        transactions: updatedTransactions,
        totals: totals(updatedTransactions),
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
        transactions: [],
        totals: totals([]),
      };

      await updateCurrency(updatedSelectedCurrency);
      handleCloseModals();
    } catch (error) {
      console.error('Failed to remove all transactions:', error);
      alert('Failed to remove all transactions. Please try again.');
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
        <div className="grid gap-4 mb-4 w-full mt-14 lg:mt-auto">
          <div className='grid grid-cols-1 gap-4 mb-4'>
            <Card>
              <DetailHeader
                currentFetchedCurrency={currentFetchedCurrency}
                selectedAsset={selectedAsset}
                currencyQuote={currencyQuote}
                onAddTransaction={handleOpenAddTransactionModal}
                onRemoveAllTransactions={handleOpenRemoveAllTransactionsModal}
              />
              <DetailTransactionTable
                selectedAsset={selectedAsset}
                fetchedCurrencies={fetchedCurrencies || []}
                currentFetchedCurrency={currentFetchedCurrency}
                currencyQuote={currencyQuote}
                onEditTransaction={handleOpenEditTransactionModal}
                onRemoveTransaction={handleOpenRemoveTransactionModal}
              />
            </Card>
            {selectedAsset && selectedAsset.transactions.length > 0 &&
              <Card>
                <DetailCharts selectedAsset={selectedAsset} currencyQuote={currencyQuote} />
              </Card>}

          </div>

          <DetailModals
            openAddTransactionModal={openAddTransactionModal}
            openEditTransactionModal={openEditTransactionModal}
            openRemoveTransactionModal={openRemoveTransactionModal}
            openRemoveAllTransactionsModal={openRemoveAllTransactionsModal}
            currentTransaction={currentTransaction}
            currencyQuote={currencyQuote}
            selectedAssetName={selectedAsset?.name}
            onCloseModals={handleCloseModals}
            onFormSubmit={handleFormSubmit}
            onRemoveTransaction={handleRemoveTransaction}
            onRemoveAllTransactions={handleRemoveAllTransactions}
          />
        </div>
      </Page>
    </LoadingErrorWrapper>
  );
};

export default Detail;