import {
  percentageDifference,
  averagePurchasePrice,
  currentValue,
} from './calculateHelpers';
import { Asset, GlobalTotals, SelectedCurrency } from '../types/store';
import { FetchedCurrency } from '../types/currency';

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
 * @param currencies - The dictionary of all currencies.
 * @returns An object adhering to the GlobalTotals interface.
 */
export const getGlobalTotals = (
  selectedCurrencies: SelectedCurrency[] = [],
  currencies: Record<string, FetchedCurrency>
): GlobalTotals => {
  let totalAmount = 0;
  let totalPurchasePrice = 0;
  let totalValue = 0;

  selectedCurrencies.forEach((selectCurrency) => {
    const currentPrice = currencies[selectCurrency.cmc_id]?.price || 0;

    selectCurrency.assets.forEach((asset) => {
      const amount = parseFloat(asset.amount);
      const purchasePrice = parseFloat(asset.purchasePrice);

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
    totalAmount: selectedCurrencies.length > 0 ? totalAmount : 0,
    totalValue: selectedCurrencies.length > 0 ? totalValue : 0,
    totalPurchasePrice: selectedCurrencies.length > 0 ? totalPurchasePrice : 0,
    totalPercentageDifference:
      selectedCurrencies.length > 0 ? totalPercentageDifference : 0,
    totalAveragePurchasePrice:
      selectedCurrencies.length > 0 ? totalAveragePurchasePrice : 0,
  };
};

export default totals;
