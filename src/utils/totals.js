import {
  PercentageDifference,
  AveragePurchasePrice,
  CurrentValue,
} from "../utils/CalculateHelpers";

const totals = (assets = []) => {
  const totalAmount = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.amount),
    0
  );
  const totalPurchasePrice = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.purchasePrice),
    0
  );
  const totalAveragePurchasePrice = AveragePurchasePrice(
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

export const getGlobalTotals = (assets = [], currencies) => {
  const totalValue = assets.reduce(
    (acc, asset) =>
      acc +
      parseFloat(
        CurrentValue(asset.totals.totalAmount, currencies[asset.index].price)
      ),
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
