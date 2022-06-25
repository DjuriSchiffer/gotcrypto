import { PercentageFormat, CurrencyFormat } from '../utils/CalculateHelpers';

const OverviewTotals = ({ totals }) => {
    const totalAmount = totals.totalAmount;
    const totalPurchasePrice = totals.totalPurchasePrice;
    const totalValue = totals.totalValue;
    const totalAveragePurchasePrice = totals.totalAveragePurchasePrice;
    const totalPercentageDifference = totals.totalPercentageDifference;

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