import {
  percentageDifference as percentageDifferenceFn,
  percentageFormat,
  currencyFormat,
  averagePurchasePrice as averagePurchasePriceFn,
  currentValue as currentValueFn,
  dateFormat,
} from '../utils/calculateHelpers';
import classNames from 'classnames';
import { Table } from 'flowbite-react';
import { Asset, FetchedCurrency, SelectedCurrency } from '../types/currency';
import { CurrencyQuote } from 'api';

interface OverviewRowProps {
  type: 'detail';
  item: Asset;
  currentCurrency: FetchedCurrency | null;
  currencies: FetchedCurrency[] | null;
  children: React.ReactNode;
  currencyQuote: keyof CurrencyQuote
}

interface OverviewTotalsRowProps {
  type: 'detail-totals';
  item: SelectedCurrency['totals'];
  currentCurrency: FetchedCurrency | null;
  currencies?: FetchedCurrency[] | null;
  children?: React.ReactNode;
  currencyQuote: keyof CurrencyQuote
}

type TableRowComponentProps = OverviewRowProps | OverviewTotalsRowProps;

const TableRow: React.FC<TableRowComponentProps> = ({
  type,
  item,
  currentCurrency,
  children,
  currencyQuote
}) => {
  if (type === 'detail') {
    const assetItem = item;

    const amount = parseFloat(assetItem.amount);
    const purchasePrice = parseFloat(assetItem.purchasePrice);
    const purchaseDate = dateFormat(assetItem.date);
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
          {currencyFormat(purchasePrice, currencyQuote)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {purchaseDate}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(currentValue, currencyQuote)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(averagePurchasePrice, currencyQuote)}
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

  if (type === 'detail-totals') {
    const totalsItem = item as SelectedCurrency['totals'];

    const totalAmount = totalsItem.totalAmount;
    const totalPurchasePrice = parseFloat(
      totalsItem.totalPurchasePrice.toString()
    );
    const totalValue = currentValueFn(totalAmount, currentCurrency?.price || 0);
    const totalAveragePurchasePrice = averagePurchasePriceFn(
      totalPurchasePrice,
      totalAmount
    );
    const totalPercentageDifference = percentageDifferenceFn(
      totalPurchasePrice,
      totalValue
    );

    return (
      <Table.Row>
        <Table.Cell className="py-2 pl-3 text-gray-900 dark:text-white">
          {totalAmount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalPurchasePrice, currencyQuote)}
        </Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalValue, currencyQuote)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalAveragePurchasePrice)}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          <div
            className={classNames('flex', {
              'text-blue-500': totalPercentageDifference > 0,
              'text-red-500': totalPercentageDifference < 0,
            })}
          >
            {percentageFormat(totalPercentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell></Table.Cell>
      </Table.Row>
    );
  }

  return null;
};

export default TableRow;
