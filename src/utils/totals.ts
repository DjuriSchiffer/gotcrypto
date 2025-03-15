import {
  percentageDifference,
  averagePurchasePrice,
  currentValue,
} from './helpers';
import { Transaction, FetchedCurrency, SelectedAsset } from '../types/currency';
import { GlobalTotals } from 'store';

/**
 * Calculates totals based on the selected currencies and their transactions.
 * @param transactions - The array of transactions.
 * @returns An object containing various totals.
 */
const totals = (transactions: Transaction[] = []): SelectedAsset['totals'] => {
  if (transactions.length === 0) {
    return {
      totalAmount: 0,
      totalAmountBought: 0,
      totalAmountSold: 0,
      totalPurchasePrice: 0,
      totalSellPrice: 0,
      totalAveragePurchasePrice: 0,
      totalAverageSellPrice: 0,
      totalInvested: 0
    };
  }

  const sums = transactions.reduce((acc, transaction) => {
    const amount = parseFloat(transaction.amount);
    const purchasePrice = parseFloat(transaction.purchasePrice);

    switch (transaction?.type) {
      case 'buy':
        acc.amountBought += amount;
        acc.purchasePrice += purchasePrice;
        break;
      case 'sell':
        acc.amountSold += amount;
        acc.sellPrice += purchasePrice;
        break;
      case 'transfer':
        if (transaction.transferType === 'in') {
          acc.amountTransferedIn += amount;
          acc.valueTransferedIn += purchasePrice;
        } else if (transaction.transferType === 'out') {
          acc.amountTransferedOut += amount;
          acc.valueTransferedOut += purchasePrice;
        }
        break;
    }

    return acc;
  }, {
    amountBought: 0,
    amountSold: 0,
    amountTransferedIn: 0,
    amountTransferedOut: 0,
    purchasePrice: 0,
    sellPrice: 0,
    valueTransferedIn: 0,
    valueTransferedOut: 0
  });

  const totalAmount = (sums.amountBought + sums.amountTransferedIn) -
    (sums.amountSold + sums.amountTransferedOut);

  const totalInvested = sums.purchasePrice - sums.sellPrice;

  return {
    totalAmount,
    totalAmountBought: sums.amountBought,
    totalAmountSold: sums.amountSold,
    totalPurchasePrice: sums.purchasePrice,
    totalSellPrice: sums.sellPrice,
    totalAveragePurchasePrice: averagePurchasePrice(sums.purchasePrice, sums.amountBought),
    totalAverageSellPrice: averagePurchasePrice(sums.sellPrice, sums.amountSold),
    totalInvested
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


export const getTotalAmount = (
  assetMap: Map<number, SelectedAsset>,
  cmcId: number
): number => {
  return assetMap.get(cmcId)?.totals.totalAmount || 0;
};

export const getTotalValue = (
  assetMap: Map<number, SelectedAsset>,
  cmcId: number
): number => {
  const totalAmount = assetMap.get(cmcId)?.totals.totalAmount || 0;
  return totalAmount || 0;
};

export const getTotalPurchasePrice = (
  cryptoMap: Map<number, SelectedAsset>,
  cmcId: number
): number => {
  return cryptoMap.get(cmcId)?.totals.totalPurchasePrice || 0;
};

export const getTotalPercentageDifference = (
  assetMap: Map<number, SelectedAsset>,
  cmcId: number,
  currentMarketPrice: number
): number => {
  const currency = assetMap.get(cmcId);
  if (
    !currency ||
    !currency.totals.totalAmount ||
    !currency.totals.totalPurchasePrice
  ) {
    return 0;
  }

  const totalValue = currentValue(
    currency.totals.totalAmount,
    currentMarketPrice
  );
  return percentageDifference(currency.totals.totalPurchasePrice, totalValue);
};