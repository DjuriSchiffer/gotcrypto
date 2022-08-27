import { PercentageDifference, PercentageFormat, CurrencyFormat, AveragePurchasePrice, Profit, CurrentValue, DateFormat } from '../utils/CalculateHelpers';

const OverviewRow = ({asset, currentCurrency, children}) => {
    const amount = asset.amount;
    const purchasePrice = asset.purchasePrice;
    const purchaseDate = DateFormat(asset.date);
    const currentValue = CurrentValue(amount, currentCurrency.price);
    const averagePurchasePrice = AveragePurchasePrice(purchasePrice, amount);
    const percentageDifference = PercentageDifference(purchasePrice, currentValue);

    return (
        <tr>
            <td>{asset.amount}</td>
            <td>{CurrencyFormat(purchasePrice)}</td>
            <td>{purchaseDate}</td>
            <td>{CurrencyFormat(currentValue)}</td>
            <td>{CurrencyFormat(averagePurchasePrice)}</td>
            <td>{PercentageFormat(percentageDifference)}</td>
            <td>{children}</td>
        </tr>
    );
};

export default OverviewRow;