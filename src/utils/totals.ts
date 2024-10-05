// src/utils/totals.ts

import {
  percentageDifference,
  averagePurchasePrice,
  currentValue,
} from './calculateHelpers';
import { Currency, GlobalTotals } from '../types/store';

/**
 * Calculates totals based on the selected currencies and their assets.
 * @param assets - The array of selected currencies.
 * @returns An object containing various totals.
 */
const totals = (assets: Currency[] = []): Partial<GlobalTotals> => {
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
 * @param assets - The array of selected currencies.
 * @param currencies - The dictionary of all currencies.
 * @returns An object adhering to the GlobalTotals interface.
 */
export const getGlobalTotals = (
  assets: Currency[] = [],
  currencies: Record<string, Currency>
): GlobalTotals => {
  const totalAmount = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.amount),
    0
  );
  const totalValue = assets.reduce(
    (acc, asset) =>
      acc +
      currentValue(
        asset.totals.totalAmount,
        Object.values(currencies)[asset.index].price
      ),
    0
  );

  const totalPurchasePrice = assets.reduce(
    (acc, asset) => acc + asset.totals.totalPurchasePrice,
    0
  );

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
    totalAmount: assets.length > 0 ? totalAmount : 0,
    totalValue: assets.length > 0 ? totalValue : 0,
    totalPurchasePrice: assets.length > 0 ? totalPurchasePrice : 0,
    totalPercentageDifference:
      assets.length > 0 ? totalPercentageDifference : 0,
    totalAveragePurchasePrice:
      assets.length > 0 ? totalAveragePurchasePrice : 0,
  };
};

export default totals;
