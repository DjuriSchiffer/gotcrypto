import type { CurrencyQuote } from 'api';

import { Button, useThemeMode } from 'flowbite-react';
import { FaPen, FaTrashAlt } from 'react-icons/fa';

import type { FetchedCurrency, SelectedAsset, Transaction } from '../types/currency';

import Table from './Table';
import TableRow from './TableRow';

type DetailTransactionTableProps = {
	currencyQuote: keyof CurrencyQuote;
	currentFetchedCurrency: FetchedCurrency;
	fetchedCurrencies: Array<FetchedCurrency>;
	onEditTransaction: (transaction: Transaction) => void;
	onRemoveTransaction: (transaction: Transaction) => void;
	selectedAsset?: SelectedAsset;
};

function DetailTransactionTable({
	currencyQuote,
	currentFetchedCurrency,
	fetchedCurrencies,
	onEditTransaction,
	onRemoveTransaction,
	selectedAsset,
}: DetailTransactionTableProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';
	if (!selectedAsset || selectedAsset.transactions.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center text-dark dark:text-white">
				<span>No transactions added yet.</span>
			</div>
		);
	}

	const groupTransactionsByYear = (transactions: Array<Transaction>) => {
		return transactions.reduce<Record<number, Array<Transaction>>>((acc, transaction) => {
			const year = new Date(transaction.date).getFullYear();
			(acc[year] ??= []).push(transaction);
			return acc;
		}, {});
	};

	const groupedTransactions: Record<number, Array<Transaction>> = groupTransactionsByYear(
		selectedAsset.transactions
	);

	const years = Object.keys(groupedTransactions)
		.map(Number)
		.sort((a, b) => b - a);

	return (
		<Table type="detail">
			{years.map((year, yearIndex) => {
				const yearTransactions = groupedTransactions[year];
				const isLastYear = yearIndex === years.length - 1;

				return yearTransactions.map((transaction: Transaction, index: number) => {
					const isLastInYear = index === yearTransactions.length - 1;
					const isYearSeparator = isLastInYear && !isLastYear;

					return (
						<TableRow
							currencies={fetchedCurrencies}
							currencyQuote={currencyQuote}
							fetchedCurrency={currentFetchedCurrency}
							isYearSeparator={isYearSeparator}
							item={transaction}
							key={transaction.id}
							type="detail"
							yearCell={index === 0 ? year.toString() : ''}
						>
							<Button
								className="mr-2"
								color={isDarkMode ? 'gray' : 'light'}
								onClick={() => {
									onEditTransaction(transaction);
								}}
								size="sm"
							>
								<FaPen color={isDarkMode ? 'white' : 'black'} />
							</Button>
							<Button
								color={isDarkMode ? 'gray' : 'light'}
								onClick={() => {
									onRemoveTransaction(transaction);
								}}
								size="sm"
							>
								<FaTrashAlt color={isDarkMode ? 'white' : 'black'} />
							</Button>
						</TableRow>
					);
				});
			})}
		</Table>
	);
}

export default DetailTransactionTable;
