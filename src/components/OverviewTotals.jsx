import { PercentageDifference, PercentageFormat, CurrencyFormat, AveragePurchasePrice, Profit, CurrentValue, DateFormat } from '../utils/CalculateHelpers';

const OverviewTotals = ({assets, currentCurrency}) => {
    const totalAmount = assets.reduce((acc, asset) => acc + parseInt(asset.amount), 0);
    const totalPurchasePrice = assets.reduce((acc, asset) => acc + parseInt(asset.purchasePrice), 0);
    const totalValue = CurrentValue(totalAmount, currentCurrency.price);
    const totalAveragePurchasePrice = AveragePurchasePrice(totalPurchasePrice, totalAmount);
    const totalPercentageDifference = PercentageDifference(totalPurchasePrice, totalValue);

    return (
        <div>
            {totalAmount}
            {CurrencyFormat(totalPurchasePrice)}
            {CurrencyFormat(totalValue)}
            {CurrencyFormat(totalAveragePurchasePrice)}
            {PercentageFormat(totalPercentageDifference)}
        </div>
    );
};

export default OverviewTotals;