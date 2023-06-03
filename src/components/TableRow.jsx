import {
  PercentageDifference,
  PercentageFormat,
  CurrencyFormat,
  AveragePurchasePrice,
  CurrentValue,
  DateFormat,
} from "../utils/CalculateHelpers";
import classNames from "classnames";
import { getImage } from "../utils/images";
import { Table } from "flowbite-react";

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

    const totalPercentageDifference = PercentageDifference(
      item.totals.totalPurchasePrice,
      totalValue
    );

    return (
      <Table.Row>
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex items-center">
            <img
              width={32}
              height={32}
              src={getImage(currencies[item.index].cmc_id)}
            />
            <div className="pl-2">{item.label}</div>
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div>{CurrencyFormat(currencies[item.index].price)}</div>
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div className="flex flex-col">
              <div>{CurrencyFormat(totalValue)}</div>
              <div className="text-sm">{item.totals.totalAmount}</div>
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div className="flex flex-col">
              <div>{CurrencyFormat(item.totals.totalPurchasePrice)}</div>
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div
              className={classNames("flex", {
                "text-blue": totalPercentageDifference > 0,
                "text-loss": totalPercentageDifference < 0,
              })}
            >
              {PercentageFormat(totalPercentageDifference)}
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 pr-2 text-gray-900 dark:text-whitetext-right flex items-center justify-end">
          {children}
        </Table.Cell>
      </Table.Row>
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
      <Table.Row>
        <Table.Cell className="py-2 pl-3 text-gray-900 dark:text-white">
          {amount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(purchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {purchaseDate}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(currentValue)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(averagePurchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div
            className={classNames("flex", {
              "text-blue": percentageDifference > 0,
              "text-loss": percentageDifference < 0,
            })}
          >
            {PercentageFormat(percentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 pr-2 text-right flex items-center justify-end text-gray-900 dark:text-white">
          {children}
        </Table.Cell>
      </Table.Row>
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
      <Table.Row>
        <Table.Cell className="py-2 pl-3 text-gray-900 dark:text-white">
          {totalAmount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(totalPurchasePrice)}
        </Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(totalValue)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {CurrencyFormat(totalAveragePurchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div
            className={classNames("flex", {
              "text-blue": totalPercentageDifference > 0,
              "text-loss": totalPercentageDifference < 0,
            })}
          >
            {PercentageFormat(totalPercentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell></Table.Cell>
      </Table.Row>
    );
  }
};

export default TableRow;
