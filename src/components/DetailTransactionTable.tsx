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

    return (
        <Table type="detail">
            {selectedAsset.transactions.map((transaction: Transaction) => (
                <TableRow
                    key={transaction.id}
                    type="detail"
                    item={transaction}
                    currencies={fetchedCurrencies}
                    fetchedCurrency={currentFetchedCurrency}
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
                selectedAsset?.totals && (
                    <TableRow
                        type="detail-totals"
                        item={selectedAsset.totals}
                        fetchedCurrency={currentFetchedCurrency}
                        currencyQuote={currencyQuote}
                    ></TableRow>
                )}
        </Table>
    );
};

export default DetailTransactionTable;