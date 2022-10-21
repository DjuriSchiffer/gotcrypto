import {
  PercentageDifference,
  AveragePurchasePrice,
  CurrentValue,
} from "../utils/CalculateHelpers";

const totals = (assets = [], currentCurrency = {}) => {
  const totalAmount = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.amount),
    0
  );
  const totalPurchasePrice = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.purchasePrice),
    0
  );
  const totalValue = CurrentValue(totalAmount, currentCurrency.price);
  console.log("totalValue", totalValue);
  const totalAveragePurchasePrice = AveragePurchasePrice(
    totalPurchasePrice,
    totalAmount
  );
  const totalPercentageDifference = PercentageDifference(
    totalPurchasePrice,
    totalValue
  );

  return {
    totalAmount: assets.length > 0 ? totalAmount : 0,
    totalPurchasePrice: assets.length > 0 ? totalPurchasePrice : 0,
    totalValue: assets.length > 0 ? totalValue : 0,
    totalAveragePurchasePrice:
      assets.length > 0 ? totalAveragePurchasePrice : 0,
    totalPercentageDifference:
      assets.length > 0 ? totalPercentageDifference : 0,
  };
};

export const getGlobalTotals = (assets = []) => {
  const totalValue = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.totals.totalValue),
    0
  );
  const totalPurchasePrice = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.totals.totalPurchasePrice),
    0
  );
  const totalPercentageDifference = PercentageDifference(
    totalPurchasePrice,
    totalValue
  );

  return {
    totalValue: assets.length > 0 ? totalValue : 0,
    totalPurchasePrice: assets.length > 0 ? totalPurchasePrice : 0,
    totalPercentageDifference:
      assets.length > 0 ? totalPercentageDifference : 0,
  };
};

export default totals;
