import {
  percentageDifference as percentageDifferenceFn,
  percentageFormat,
  currencyFormat,
  averagePurchasePrice as averagePurchasePriceFn,
  currentValue as currentValueFn,
  dateFormat,
} from '../utils/calculateHelpers';
import classNames from 'classnames';
import { getImage } from '../utils/images';
import { Table } from 'flowbite-react';
import { Currency } from '../types/store';

type RowType = 'dashboard' | 'overview' | 'overview-totals';

interface TableRowComponentProps {
  item: Currency;
  type?: RowType;
  currentCurrency: Currency | null;
  currencies: Record<string, Currency>;
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowComponentProps> = ({
  item,
  type = 'dashboard',
  currentCurrency,
  currencies,
  children,
}) => {
  if (type === 'dashboard') {
    const totalValue = currentValueFn(
      item.totals.totalAmount,
      Object.values(currencies)[item.index].price
    );

    const totalpercentageDifference = percentageDifferenceFn(
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
              src={getImage(Object.values(currencies)[item.index].cmc_id)}
              alt={`${item.name} icon`}
            />
            <div className="pl-2">{item.name}</div>
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div>
            {currencyFormat(Object.values(currencies)[item.index].price)}
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div className="flex flex-col">
              <div>{currencyFormat(totalValue)}</div>
              <div className="text-sm">{item.totals.totalAmount}</div>
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div className="flex flex-col">
              <div>{currencyFormat(item.totals.totalPurchasePrice)}</div>
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {item.totals && (
            <div
              className={classNames('flex', {
                'text-blue-500': totalpercentageDifference > 0,
                'text-red-500': totalpercentageDifference < 0,
              })}
            >
              {percentageFormat(totalpercentageDifference)}
            </div>
          )}
        </Table.Cell>
        <Table.Cell className="py-2 pr-2 text-right flex items-center justify-end">
          {children}
        </Table.Cell>
      </Table.Row>
    );
  }

  if (type === 'overview') {
    const amount = parseFloat(item.amount);
    const purchasePrice = parseFloat(item.purchasePrice);
    const purchaseDate = dateFormat(item.date);
    const currentValue = currentValueFn(amount, currentCurrency?.price || 0);
    const averagePurchasePrice = averagePurchasePriceFn(purchasePrice, amount);
    const percentageDifference = percentageDifferenceFn(
      purchasePrice,
      currentValue
    );

    return (
      <Table.Row>
        <Table.Cell className="py-2 pl-3 text-gray-900 dark:text-white">
          {amount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(purchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {purchaseDate}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(currentValue)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(averagePurchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div
            className={classNames('flex', {
              'text-blue-500': percentageDifference > 0,
              'text-red-500': percentageDifference < 0,
            })}
          >
            {percentageFormat(percentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 pr-2 text-right flex items-center justify-end text-gray-900 dark:text-white">
          {children}
        </Table.Cell>
      </Table.Row>
    );
  }

  if (type === 'overview-totals') {
    const totalAmount = item.totalAmount;
    const totalPurchasePrice = parseFloat(item.totalPurchasePrice);
    const totalValue = currentValueFn(totalAmount, currentCurrency?.price || 0);
    const totalaveragePurchasePrice = averagePurchasePriceFn(
      totalPurchasePrice,
      totalAmount
    );
    const totalpercentageDifference = percentageDifferenceFn(
      totalPurchasePrice,
      totalValue
    );

    return (
      <Table.Row>
        <Table.Cell className="py-2 pl-3 text-gray-900 dark:text-white">
          {totalAmount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalPurchasePrice)}
        </Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalValue)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalaveragePurchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div
            className={classNames('flex', {
              'text-blue-500': totalpercentageDifference > 0,
              'text-red-500': totalpercentageDifference < 0,
            })}
          >
            {percentageFormat(totalpercentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell></Table.Cell>
      </Table.Row>
    );
  }

  return null;
};

export default TableRow;
