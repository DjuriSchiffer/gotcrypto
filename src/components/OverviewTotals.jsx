import { PercentageDifference, PercentageFormat, CurrencyFormat, AveragePurchasePrice, Profit, CurrentValue, DateFormat } from '../utils/CalculateHelpers';

const OverviewTotals = ({ assets, currentCurrency }) => {
    const totalAmount = assets.reduce((acc, asset) => acc + parseInt(asset.amount), 0);
    const totalPurchasePrice = assets.reduce((acc, asset) => acc + parseInt(asset.purchasePrice), 0);
    const totalValue = CurrentValue(totalAmount, currentCurrency.price);
    const totalAveragePurchasePrice = AveragePurchasePrice(totalPurchasePrice, totalAmount);
    const totalPercentageDifference = PercentageDifference(totalPurchasePrice, totalValue);

    return (
        <div className="flex mt-5 pt-1 border-t-2 border-black">
            <div className="mr-2">{totalAmount}</div>
            <div className="mr-2">{CurrencyFormat(totalPurchasePrice)}</div>
            <div className="mr-2">{CurrencyFormat(totalValue)}</div>
            <div className="mr-2">{CurrencyFormat(totalAveragePurchasePrice)}</div>
            <div className="mr-2">{PercentageFormat(totalPercentageDifference)}</div>
        </div>
    );
};

export default OverviewTotals;