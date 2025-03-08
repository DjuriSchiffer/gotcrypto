import React from 'react';
import { Button } from 'flowbite-react';
import { FaPen, FaTrashAlt } from 'react-icons/fa';
import Table from './Table';
import TableRow from './TableRow';
import { Transaction, SelectedAsset } from '../types/currency';
import { CurrencyQuote } from 'api';

interface DetailTransactionTableProps {
    selectedAsset?: SelectedAsset;
    fetchedCurrencies: any[];
    currentFetchedCurrency: any;
    currencyQuote: keyof CurrencyQuote;
    onEditTransaction: (transaction: Transaction) => void;
    onRemoveTransaction: (transaction: Transaction) => void;
}

const DetailTransactionTable: React.FC<DetailTransactionTableProps> = ({
    selectedAsset,
    fetchedCurrencies,
    currentFetchedCurrency,
    currencyQuote,
    onEditTransaction,
    onRemoveTransaction,
}) => {
    if (!selectedAsset || selectedAsset.transactions.length === 0) {
        return (
            <div className="text-white flex items-center justify-center h-40">
                <span>No transactions added yet.</span>
            </div>
        );
    }

    const groupTransactionsByYear = (transactions: Transaction[]) => {
        return transactions.reduce((acc, transaction) => {
            const year = new Date(transaction.date).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(transaction);
            return acc;
        }, {} as { [key: number]: Transaction[] });
    };

    const groupedTransactions: { [key: number]: Transaction[] } = groupTransactionsByYear(selectedAsset.transactions);

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
                            key={transaction.id}
                            type="detail"
                            item={transaction}
                            currencies={fetchedCurrencies}
                            fetchedCurrency={currentFetchedCurrency}
                            currencyQuote={currencyQuote}
                            yearCell={index === 0 ? year.toString() : ''}
                            isYearSeparator={isYearSeparator}
                        >
                            <Button
                                size="sm"
                                onClick={() => onEditTransaction(transaction)}
                                className="mr-2"
                                color="gray"
                            >
                                <FaPen color="white" />
                            </Button>
                            <Button
                                size="sm"
                                color="dark"
                                onClick={() => onRemoveTransaction(transaction)}
                            >
                                <FaTrashAlt color="white" />
                            </Button>
                        </TableRow>
                    );
                });
            })}

            {selectedAsset?.totals && (
                <TableRow
                    type="detail-totals"
                    item={selectedAsset.totals}
                    fetchedCurrency={currentFetchedCurrency}
                    currencyQuote={currencyQuote}
                />
            )}
        </Table>
    );
};

export default DetailTransactionTable;