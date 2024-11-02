import React from 'react';
import { Button } from 'flowbite-react';
import { FaPen, FaTrashAlt } from 'react-icons/fa';
import Table from './Table';
import TableRow from './TableRow';
import { Transaction, SelectedCurrency } from '../types/currency';
import { CurrencyQuote } from 'api';

interface DetailTransactionTableProps {
    selectedCurrency?: SelectedCurrency;
    fetchedCurrencies: any[];
    currentFetchedCurrency: any;
    currencyQuote: keyof CurrencyQuote;
    onEditTransaction: (transaction: Transaction) => void;
    onRemoveTransaction: (transaction: Transaction) => void;
}

const DetailTransactionTable: React.FC<DetailTransactionTableProps> = ({
    selectedCurrency,
    fetchedCurrencies,
    currentFetchedCurrency,
    currencyQuote,
    onEditTransaction,
    onRemoveTransaction,
}) => {
    if (!selectedCurrency || selectedCurrency.transactions.length === 0) {
        return (
            <div className="text-white flex items-center justify-center h-40">
                <span>No transactions added yet.</span>
            </div>
        );
    }

    return (
        <Table type="detail">
            {selectedCurrency.transactions.map((transaction: Transaction) => (
                <TableRow
                    key={transaction.id}
                    type="detail"
                    item={transaction}
                    currencies={fetchedCurrencies}
                    currentCurrency={currentFetchedCurrency}
                    currencyQuote={currencyQuote}
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
            ))}
            {
                selectedCurrency?.totals && (
                    <TableRow
                        type="detail-totals"
                        item={selectedCurrency.totals}
                        currentCurrency={currentFetchedCurrency}
                        currencyQuote={currencyQuote}
                    ></TableRow>
                )}
        </Table>
    );
};

export default DetailTransactionTable;