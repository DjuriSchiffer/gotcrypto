import {
  percentageDifference,
  averagePurchasePrice,
  currentValue,
} from './calculateHelpers';
import { Asset, FetchedCurrency, SelectedCurrency } from '../types/currency';
import { GlobalTotals } from 'store';

/**
 * Calculates totals based on the selected currencies and their assets.
 * @param assets - The array of selected currencies.
 * @returns An object containing various totals.
 */
const totals = (assets: Asset[] = []): SelectedCurrency['totals'] => {
  const totalAmount = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.amount),
    0
  );
  const totalPurchasePrice = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.purchasePrice),
    0
  );
  const totalAveragePurchasePrice = averagePurchasePrice(
    totalPurchasePrice,
    totalAmount
  );

  return {
    totalAmount: assets.length > 0 ? totalAmount : 0,
    totalPurchasePrice: assets.length > 0 ? totalPurchasePrice : 0,
    totalAveragePurchasePrice:
      assets.length > 0 ? totalAveragePurchasePrice : 0,
  };
};

/**
 * Calculates global totals including total value and percentage differences.
 * @param selectedCurrencies - The array of selected currencies.
 * @param fetchedCurrencies - The array of all fetched currencies.
 * @returns An object adhering to the GlobalTotals interface.
 */
export const getGlobalTotals = (
  selectedCurrencies: SelectedCurrency[] = [],
  fetchedCurrencies: FetchedCurrency[] | null = []
): GlobalTotals => {
  const filteredSelectedCurrencies = selectedCurrencies.filter(
    (currency) => currency.assets && currency.assets.length > 0
  );

  let totalAmount = 0;
  let totalPurchasePrice = 0;
  let totalValue = 0;

  filteredSelectedCurrencies.forEach((selectCurrency) => {
    const fetchedCurrency = fetchedCurrencies?.find(
      (currency) => currency.cmc_id === selectCurrency.cmc_id
    );

    const currentPrice = fetchedCurrency?.price || 0;

    selectCurrency.assets.forEach((asset) => {
      const amount =
        typeof asset.amount === 'string'
          ? parseFloat(asset.amount)
          : asset.amount;
      const purchasePrice =
        typeof asset.purchasePrice === 'string'
          ? parseFloat(asset.purchasePrice)
          : asset.purchasePrice;

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
