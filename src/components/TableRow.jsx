import {
  PercentageDifference,
  PercentageFormat,
  CurrencyFormat,
  AveragePurchasePrice,
  CurrentValue,
  DateFormat,
} from "../utils/CalculateHelpers";
import classNames from "classnames";

const TableRow = ({
  item,
  type = "dashboard",
  currentCurrency,
  currencies,
  children,
}) => {
  if (type === "dashboard") {
    return (
      <tr>
        <td className="py-2 pl-2 border-white">
          <div className="flex items-center">
            <img
              width={32}
              height={32}
              src={`https://s2.coinmarketcap.com/static/img/coins/32x32/${
                currencies[item.index].cmc_id
              }.png`}
            />
            <div className="pl-2">{item.label}</div>
          </div>
        </td>
        <td className="py-2 border-white">
          <div>{CurrencyFormat(currencies[item.index].price)}</div>
        </td>
        <td className="py-2 border-white">
          {item.totals && (
            <div className="flex flex-col">
              <div>{CurrencyFormat(item.totals.totalValue)}</div>
              <div className="text-sm">{item.totals.totalAmount}</div>
            </div>
          )}
        </td>
        <td className="py-2 border-white">
          {item.totals && (
            <div
              className={classNames("flex", {
                "text-green": item.totals.totalPercentageDifference > 0,
                "text-red": item.totals.totalPercentageDifference < 0,
              })}
            >
              {PercentageFormat(item.totals.totalPercentageDifference)}
            </div>
          )}
        </td>
        <td className="py-2 pr-2 border-white text-right flex items-center justify-end">
          {children}
        </td>
      </tr>
    );
  }

  if (type === "overview") {
    const amount = item.amount;
    const purchasePrice = item.purchasePrice;
    const purchaseDate = DateFormat(item.date);
    const currentValue = CurrentValue(amount, currentCurrency.price);
    const averagePurchasePrice = AveragePurchasePrice(purchasePrice, amount);
    const percentageDifference = PercentageDifference(
      purchasePrice,
      currentValue
    );
    return (
      <tr>
        <td className="py-2 pl-2 border-white">{amount}</td>
        <td className="py-2 border-white">{CurrencyFormat(purchasePrice)}</td>
        <td className="py-2 border-white">{purchaseDate}</td>
        <td className="py-2 border-white">{CurrencyFormat(currentValue)}</td>
        <td className="py-2 border-white">
          {CurrencyFormat(averagePurchasePrice)}
        </td>
        <td className="py-2 border-white">
          {PercentageFormat(percentageDifference)}
        </td>
        <td className="py-2 pr-2 border-white text-right flex items-center justify-end">
          {children}
        </td>
      </tr>
    );
  }

  if (type === "overview-totals") {
    const totalAmount = item.totalAmount;
    const totalPurchasePrice = item.totalPurchasePrice;
    const totalValue = item.totalValue;
    const totalAveragePurchasePrice = item.totalAveragePurchasePrice;
    const totalPercentageDifference = item.totalPercentageDifference;

    return (
      <tr className="border-t-2">
        <td className="py-2 pl-2 border-white">{totalAmount}</td>
        <td className="py-2 border-white">
          {CurrencyFormat(totalPurchasePrice)}
        </td>
        <td></td>
        <td className="py-2 border-white">{CurrencyFormat(totalValue)}</td>
        <td className="py-2 border-white">
          {CurrencyFormat(totalAveragePurchasePrice)}
        </td>
        <td className="py-2 border-white">
          {PercentageFormat(totalPercentageDifference)}
        </td>
      </tr>
    );
  }
};

export default TableRow;
