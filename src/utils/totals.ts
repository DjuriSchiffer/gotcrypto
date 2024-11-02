import {
  percentageDifference,
  averagePurchasePrice,
  currentValue,
} from './calculateHelpers';
import { Transaction, FetchedCurrency, SelectedAsset } from '../types/currency';
import { GlobalTotals } from 'store';

/**
 * Calculates totals based on the selected currencies and their transactions.
 * @param transactions - The array of selected currencies.
 * @returns An object containing various totals.
 */
const totals = (transactions: Transaction[] = []): SelectedAsset['totals'] => {
  const totalAmount = transactions.reduce(
    (acc, transaction) => acc + parseFloat(transaction.amount),
    0
  );
  const totalPurchasePrice = transactions.reduce(
    (acc, transaction) => acc + parseFloat(transaction.purchasePrice),
    0
  );
  const totalAveragePurchasePrice = averagePurchasePrice(
    totalPurchasePrice,
    totalAmount
  );

  return {
    totalAmount: transactions.length > 0 ? totalAmount : 0,
    totalPurchasePrice: transactions.length > 0 ? totalPurchasePrice : 0,
    totalAveragePurchasePrice:
      transactions.length > 0 ? totalAveragePurchasePrice : 0,
  };
};

/**
 * Calculates global totals including total value and percentage differences.
 * @param selectedCurrencies - The array of selected currencies.
 * @param fetchedCurrencies - The array of all fetched currencies.
 * @returns An object adhering to the GlobalTotals interface.
 */
export const getGlobalTotals = (
  selectedCurrencies: SelectedAsset[] = [],
  fetchedCurrencies: FetchedCurrency[] | null = []
): GlobalTotals => {
  const filteredSelectedCurrencies = selectedCurrencies.filter(
    (currency) => currency.transactions && currency.transactions.length > 0
  );

  let totalAmount = 0;
  let totalPurchasePrice = 0;
  let totalValue = 0;

  filteredSelectedCurrencies.forEach((selectCurrency) => {
    const fetchedCurrency = fetchedCurrencies?.find(
      (currency) => currency.cmc_id === selectCurrency.cmc_id
    );

    const currentPrice = fetchedCurrency?.price || 0;

    selectCurrency.transactions.forEach((transaction) => {
      const amount =
        typeof transaction.amount === 'string'
          ? parseFloat(transaction.amount)
          : transaction.amount;
      const purchasePrice =
        typeof transaction.purchasePrice === 'string'
          ? parseFloat(transaction.purchasePrice)
          : transaction.purchasePrice;

      totalAmount += amount;
      totalPurchasePrice += purchasePrice;
      totalValue += amount * currentPrice;
    });
  });

  let totalPercentageDifference = percentageDifference(
    totalPurchasePrice,
    totalValue
  );

  const totalAveragePurchasePrice = averagePurchasePrice(
    totalPurchasePrice,
    totalAmount
  );

  if (typeof totalPercentageDifference !== 'number') {
    totalPercentageDifference = 0;
  }

  return {
    totalAmount: filteredSelectedCurrencies.length > 0 ? totalAmount : 0,
    totalValue: filteredSelectedCurrencies.length > 0 ? totalValue : 0,
    totalPurchasePrice:
      filteredSelectedCurrencies.length > 0 ? totalPurchasePrice : 0,
    totalPercentageDifference:
      filteredSelectedCurrencies.length > 0 ? totalPercentageDifference : 0,
    totalAveragePurchasePrice:
      filteredSelectedCurrencies.length > 0 ? totalAveragePurchasePrice : 0,
  };
};
export default totals;
