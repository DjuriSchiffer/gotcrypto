import { PercentageFormat, CurrencyFormat } from '../utils/CalculateHelpers';

const OverviewTotals = ({ totals }) => {
    const totalAmount = totals.totalAmount;
    const totalPurchasePrice = totals.totalPurchasePrice;
    const totalValue = totals.totalValue;
    const totalAveragePurchasePrice = totals.totalAveragePurchasePrice;
    const totalPercentageDifference = totals.totalPercentageDifference;

    return (
        <tr className="border-t-2">
            <td className="mr-2">{totalAmount}</td>
            <td className="mr-2">{CurrencyFormat(totalPurchasePrice)}</td>
            <td className="mr-2">{CurrencyFormat(totalValue)}</td>
            <td className="mr-2">{CurrencyFormat(totalAveragePurchasePrice)}</td>
            <td className="mr-2">{PercentageFormat(totalPercentageDifference)}</td>
        </tr>
    );
};

export default OverviewTotals;