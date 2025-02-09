import {
  percentageDifference as percentageDifferenceFn,
  percentageFormat,
  currencyFormat,
  averagePurchasePrice as averagePurchasePriceFn,
  currentValue as currentValueFn,
  dateForDisplay,
} from '../utils/helpers';
import classNames from 'classnames';
import { Table } from 'flowbite-react';
import { Transaction, FetchedCurrency, SelectedAsset } from '../types/currency';
import { CurrencyQuote } from 'api';
import { useStorage } from '../hooks/useStorage';

interface OverviewRowProps {
  type: 'detail';
  item: Transaction;
  fetchedCurrency: FetchedCurrency | null;
  currencies: FetchedCurrency[] | null;
  children: React.ReactNode;
  currencyQuote: keyof CurrencyQuote,
  yearCell?: string;
  isYearSeparator?: boolean
}

interface OverviewTotalsRowProps {
  type: 'detail-totals';
  item: SelectedAsset['totals'];
  fetchedCurrency: FetchedCurrency | null;
  currencies?: FetchedCurrency[] | null;
  children?: React.ReactNode;
  currencyQuote: keyof CurrencyQuote,
  yearCell?: string;
  isYearSeparator?: boolean

}

type TableRowComponentProps = OverviewRowProps | OverviewTotalsRowProps;

const TableRow: React.FC<TableRowComponentProps> = ({
  type,
  item,
  fetchedCurrency,
  children,
  currencyQuote,
  yearCell,
  isYearSeparator

}) => {
  const { dateLocale } = useStorage();
  if (type === 'detail') {
    const transactionItem = item;

    const type = transactionItem.type;
    const amount = parseFloat(transactionItem.amount);
    const purchasePrice = parseFloat(transactionItem.purchasePrice);
    const purchaseDate = dateForDisplay(transactionItem.date, dateLocale);
    const currentValue = currentValueFn(amount, fetchedCurrency?.price || 0);
    const averagePurchasePrice = averagePurchasePriceFn(purchasePrice, amount);
    const percentageDifference = percentageDifferenceFn(
      purchasePrice,
      currentValue
    );

    return (
      <Table.Row>
        <Table.Cell className={classNames('py-2 pl-3 text-gray-900 dark:text-white')}>{yearCell}</Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {!type || type === 'buy' ? 'Buy' : 'Sell'}
            </p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {purchaseDate}
            </p>
          </div>
        </Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          {amount}
        </Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          {currencyFormat(purchasePrice, currencyQuote)}
        </Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          {currencyFormat(currentValue, currencyQuote)}
        </Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          {currencyFormat(averagePurchasePrice, currencyQuote)}
        </Table.Cell>
        <Table.Cell className={classNames('py-2 text-gray-900 dark:text-white')}>
          <div
            className={classNames('flex', {
              'text-blue-500': percentageDifference > 0,
              'text-red-500': percentageDifference < 0,
            })}
          >
            {percentageFormat(percentageDifference)}
          </div>
        </Table.Cell>
        <Table.Cell className="py-2 pr-2 flex items-center justify-end text-gray-900 dark:text-white">
          {children}
        </Table.Cell>
      </Table.Row>
    );
  }

  if (type === 'detail-totals') {
    const totalsItem = item as SelectedAsset['totals'];

    const totalAmount = totalsItem.totalAmount;
    const totalPurchasePrice = parseFloat(
      totalsItem.totalPurchasePrice.toString()
    );
    const totalValue = currentValueFn(totalAmount, fetchedCurrency?.price || 0);
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
        <Table.Cell></Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {totalAmount}
        </Table.Cell>
        <Table.Cell className="py-2 text-gray-900 dark:text-white">
          {currencyFormat(totalPurchasePrice, currencyQuote)}
        </Table.Cell>
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
