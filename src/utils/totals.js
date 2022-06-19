import { PercentageDifference, PercentageFormat, CurrencyFormat, AveragePurchasePrice, Profit, CurrentValue, DateFormat } from '../utils/CalculateHelpers';

const totals = (assets = [], currentCurrency = {}) => {
    const totalAmount = assets.reduce((acc, asset) => acc + parseInt(asset.amount), 0);
    const totalPurchasePrice = assets.reduce((acc, asset) => acc + parseInt(asset.purchasePrice), 0);
    const totalValue = CurrentValue(totalAmount, currentCurrency.price);
    const totalAveragePurchasePrice = AveragePurchasePrice(totalPurchasePrice, totalAmount);
    const totalPercentageDifference = PercentageDifference(totalPurchasePrice, totalValue);

    return {
        totalAmount: assets.length > 0 ? totalAmount : 0,
        totalPurchasePrice: assets.length > 0 ? totalPurchasePrice : 0,
        totalValue : assets.length > 0 ? totalValue : 0,
        totalAveragePurchasePrice: assets.length > 0 ? totalAveragePurchasePrice : 0,
        totalPercentageDifference: assets.length > 0 ? totalPercentageDifference : 0
    }
}

export default totals;