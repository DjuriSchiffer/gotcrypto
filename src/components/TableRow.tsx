import type { CurrencyQuote } from 'api';

import classNames from 'classnames';
import { Tooltip, TableRow as FBTableRow, TableCell } from 'flowbite-react';
import { FaInfoCircle } from 'react-icons/fa';

import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import { useStorage } from '../hooks/useStorage';
import {
	averagePurchasePrice as averagePurchasePriceFn,
	currencyFormat,
	currentValue as currentValueFn,
	dateForDisplay,
	percentageDifference as percentageDifferenceFn,
	percentageFormat,
} from '../utils/helpers';

type OverviewRowProps = {
	children: React.ReactNode;
	currencies: Array<FetchedCurrency> | null;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency | null;
	isYearSeparator?: boolean;
	item: Transaction;
	type: 'detail';
	yearCell?: string;
};

type OverviewTotalsRowProps = {
	children?: React.ReactNode;
	currencies?: Array<FetchedCurrency> | null;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency | null;
	isYearSeparator?: boolean;
	item: SelectedAsset['totals'];
	type: 'detail-totals';
	yearCell?: string;
};

type TableRowComponentProps = OverviewRowProps | OverviewTotalsRowProps;

function TableRow({
	children,
	currencyQuote,
	fetchedCurrency,
	item,
	type,
	yearCell,
}: TableRowComponentProps) {
	const { dateLocale } = useStorage();
	if (type === 'detail') {
		const transactionItem = item;

		const transactionType = transactionItem.type;
		const transferType = transactionItem.transferType;
		const amount = parseFloat(transactionItem.amount);
		const price = parseFloat(transactionItem.purchasePrice);
		const purchaseDate = dateForDisplay(transactionItem.date, dateLocale);
		const currentValue = currentValueFn(amount, fetchedCurrency?.price ?? 0);
		const percentageDifference = percentageDifferenceFn(price, currentValue);
		const description = transactionItem.description ?? '';

		const formatNegativeValue =
			transactionType === 'sell' || (transactionType === 'transfer' && transferType === 'out');

		return (
			<FBTableRow>
				<TableCell className={classNames('py-2 pl-3 text-gray-900 dark:text-white')}>
					{yearCell}
				</TableCell>
				<TableCell className={classNames('py-2 text-gray-900 dark:text-white')}>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
							{transactionType === 'buy'
								? 'Buy'
								: transactionType === 'sell'
									? 'Sell'
									: 'Transfered'}
							{transactionType === 'transfer' && transferType && ` ${transferType}`}
						</p>
						<p className="truncate text-sm text-gray-500 dark:text-gray-400">{purchaseDate}</p>
					</div>
				</TableCell>
				<TableCell className={classNames('py-2 text-gray-900 dark:text-white')}>
					{currencyFormat(price, currencyQuote, undefined, formatNegativeValue)}
				</TableCell>
				<TableCell className={classNames('py-2 text-gray-900 dark:text-white')}>
					<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
						{formatNegativeValue && '-'}
						{amount}
					</p>
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">
						{transactionType !== 'sell'
							? currencyFormat(currentValue, currencyQuote, undefined, formatNegativeValue)
							: currencyFormat(price, currencyQuote, undefined, formatNegativeValue)}
					</p>
				</TableCell>
				<TableCell className={classNames('py-2 text-gray-900 dark:text-white')}>
					<div
						className={classNames('flex', {
							'text-green-500': transactionType === 'buy' && percentageDifference > 0,
							'text-red-500': transactionType === 'buy' && percentageDifference < 0,
						})}
					>
						{transactionType === 'buy' ? percentageFormat(percentageDifference) : '-'}
					</div>
				</TableCell>
				<TableCell>
					{description && (
						<Tooltip content={description}>
							<FaInfoCircle className="ml-auto" />
						</Tooltip>
					)}
				</TableCell>
				<TableCell className="flex items-center justify-end py-2 pr-2 text-gray-900 dark:text-white">
					{children}
				</TableCell>
			</FBTableRow>
		);
	} else {
		const totalsItem = item;

		const totalAmount = totalsItem.totalAmount;
		const totalPurchasePrice = parseFloat(totalsItem.totalPurchasePrice.toString());
		const totalValue = currentValueFn(totalAmount, fetchedCurrency?.price ?? 0);
		const totalAveragePurchasePrice = averagePurchasePriceFn(totalPurchasePrice, totalAmount);
		const totalPercentageDifference = percentageDifferenceFn(totalPurchasePrice, totalValue);

		return (
			<FBTableRow>
				<TableCell></TableCell>
				<TableCell></TableCell>
				<TableCell className="py-2 text-gray-900 dark:text-white">{totalAmount}</TableCell>
				<TableCell className="py-2 text-gray-900 dark:text-white">
					{currencyFormat(totalPurchasePrice, currencyQuote)}
				</TableCell>
				<TableCell className="py-2 text-gray-900 dark:text-white">
					{currencyFormat(totalValue, currencyQuote)}
				</TableCell>
				<TableCell className="py-2 text-gray-900 dark:text-white">
					{currencyFormat(totalAveragePurchasePrice)}
				</TableCell>
				<TableCell className="py-2 text-gray-900 dark:text-white">
					<div
						className={classNames('flex', {
							'text-green-500': totalPercentageDifference > 0,
							'text-red-500': totalPercentageDifference < 0,
						})}
					>
						{percentageFormat(totalPercentageDifference)}
					</div>
				</TableCell>
				<TableCell></TableCell>
			</FBTableRow>
		);
	}
}

export default TableRow;
