import React from 'react';
import { Button } from 'flowbite-react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { getImage } from '../utils/images';
import { currencyFormat } from '../utils/calculateHelpers';
import { SelectedCurrency } from '../types/currency';
import { CurrencyQuote } from 'api';

interface DetailHeaderProps {
    currentFetchedCurrency: {
        name: string;
        cmc_id: number;
        price: number;
    };
    selectedCurrency?: SelectedCurrency;
    currencyQuote: keyof CurrencyQuote;
    onAddTransaction: () => void;
    onRemoveAllTransactions: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
    currentFetchedCurrency,
    selectedCurrency,
    currencyQuote,
    onAddTransaction,
    onRemoveAllTransactions,
}) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <img
                className="inline-block mr-4"
                width={48}
                height={48}
                src={getImage(currentFetchedCurrency.cmc_id, 64)}
                alt={`${currentFetchedCurrency.name} icon`}
            />
            <div>
                <h2 className="text-3xl font-bold text-white">
                    {currentFetchedCurrency.name}
                </h2>
                <p className="text-lg text-gray-400">
                    {currencyFormat(currentFetchedCurrency.price, currencyQuote)} per unit
                </p>
            </div>
        </div>
        <div className="flex space-x-2">
            <Button onClick={onAddTransaction}>
                <FaPlus color="white" className="mr-1" />
                Add Transaction
            </Button>
            {selectedCurrency && selectedCurrency.transactions.length > 0 && (
                <Button color="failure" onClick={onRemoveAllTransactions}>
                    <FaTrashAlt color="white" className="mr-1" />
                    Remove All Transactions
                </Button>
            )}
        </div>
    </div>
);

export default DetailHeader;