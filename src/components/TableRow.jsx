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
    const totalValue = CurrentValue(
      item.totals.totalAmount,
      currencies[item.index].price
    );

    const totalPurchasePrice = item.assets.reduce(
      (acc, asset) => acc + parseFloat(item.totals.totalPurchasePrice),
      0
    );
    const totalPercentageDifference = PercentageDifference(
      totalPurchasePrice,
      totalValue
    );

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
              <div>{CurrencyFormat(totalValue)}</div>
              <div className="text-sm">{item.totals.totalAmount}</div>
            </div>
          )}
        </td>
        <td className="py-2 border-white">
          {item.totals && (
            <div
              className={classNames("flex", {
                "text-green": totalPercentageDifference > 0,
                "text-red": totalPercentageDifference < 0,
              })}
            >
              {PercentageFormat(totalPercentageDifference)}
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
        <td className="py-2 pl-3">{amount}</td>
        <td className="py-2">{CurrencyFormat(purchasePrice)}</td>
        <td className="py-2">{purchaseDate}</td>
        <td className="py-2">{CurrencyFormat(currentValue)}</td>
        <td className="py-2">{CurrencyFormat(averagePurchasePrice)}</td>
        <td className="py-2">
          <div
            className={classNames("flex", {
              "text-green": percentageDifference > 0,
              "text-red": percentageDifference < 0,
            })}
          >
            {PercentageFormat(percentageDifference)}
          </div>
        </td>
        <td className="py-2 pr-2 text-right flex items-center justify-end">
          {children}
        </td>
      </tr>
    );
  }

  if (type === "overview-totals") {
    const totalAmount = item.totalAmount;
    const totalPurchasePrice = item.totalPurchasePrice;
    const totalValue = CurrentValue(totalAmount, currentCurrency.price);
    const totalAveragePurchasePrice = item.totalAveragePurchasePrice;
    const totalPercentageDifference = PercentageDifference(
      totalPurchasePrice,
      totalValue
    );

    return (
      <tr className="shadow-line">
        <td className="py-2 pl-3">{totalAmount}</td>
        <td className="py-2">{CurrencyFormat(totalPurchasePrice)}</td>
        <td></td>
        <td className="py-2 Z">{CurrencyFormat(totalValue)}</td>
        <td className="py-2 ">{CurrencyFormat(totalAveragePurchasePrice)}</td>
        <td className="py-2 ">
          <div
            className={classNames("flex", {
              "text-green": totalPercentageDifference > 0,
              "text-red": totalPercentageDifference < 0,
            })}
          >
            {PercentageFormat(totalPercentageDifference)}
          </div>
        </td>
      </tr>
    );
  }
};

export default TableRow;
