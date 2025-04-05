import React from 'react';
import { Button } from 'flowbite-react';
import { FaTrashAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import { Transaction } from '../types/currency';
import { CurrencyQuote } from 'api';
import { FaExclamationTriangle } from 'react-icons/fa';
import TransactionForm from './TransactionForm';

interface DetailModalsProps {
    openAddTransactionModal: boolean;
    openEditTransactionModal: boolean;
    openRemoveTransactionModal: boolean;
    openRemoveAllTransactionsModal: boolean;
    currentTransaction: Transaction | null;
    currencyQuote: keyof CurrencyQuote;
    selectedAssetName?: string;
    onCloseModals: () => void;
    onFormSubmit: (formData: any) => void;
    onRemoveTransaction: () => void;
    onRemoveAllTransactions: () => void;
}

const DetailModals: React.FC<DetailModalsProps> = ({
    openAddTransactionModal,
    openEditTransactionModal,
    openRemoveTransactionModal,
    openRemoveAllTransactionsModal,
    currentTransaction,
    currencyQuote,
    selectedAssetName,
    onCloseModals,
    onFormSubmit,
    onRemoveTransaction,
    onRemoveAllTransactions,
}) => (
    <>
        <Modal
            onClose={onCloseModals}
            open={openAddTransactionModal}
            title="Add Transaction"
        >
            <TransactionForm
                key={`add-form-${openAddTransactionModal}`}
                onSubmit={onFormSubmit}
                submitLabel="Add Transaction"
                currencyQuote={currencyQuote}
                isEdit={false}
            />
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openEditTransactionModal}
            title="Edit Transaction"
        >
            <TransactionForm
                key={`edit-form-${openEditTransactionModal}-${currentTransaction?.id}`}
                onSubmit={onFormSubmit}
                defaultValues={currentTransaction ? {
                    amount: currentTransaction.amount,
                    purchasePrice: currentTransaction.purchasePrice,
                    date: currentTransaction.date,
                    transactionType: currentTransaction.type,
                    transferType: currentTransaction.transferType,
                    description: currentTransaction.description,
                    excludeForTax: currentTransaction.excludeForTax
                } : undefined}
                submitLabel="Update Transaction"
                currencyQuote={currencyQuote}
                isEdit={true}
            />
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openRemoveTransactionModal}
            title="Confirm Removal"
        >
            <div className="flex flex-col items-center">
                <FaExclamationTriangle
                    color="white"
                    className="flex mx-auto mb-4 text-6xl"
                />
                <p className="mb-4 text-white">Are you sure you want to remove this transaction?</p>
                <div className="flex space-x-2">
                    <Button color="failure" onClick={onRemoveTransaction}>
                        <FaTrashAlt color="white" className="mr-1" />
                        Remove Transaction
                    </Button>
                    <Button color="dark" onClick={onCloseModals}>Cancel</Button>
                </div>
            </div>
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openRemoveAllTransactionsModal}
            title="Confirm Removal of All Transactions"
        >
            <div className="flex flex-col items-center">
                <FaExclamationTriangle
                    color="white"
                    className="flex mx-auto mb-4 text-6xl"
                />
                <p className="mb-4 text-white">
                    Are you sure you want to remove all transactions for {selectedAssetName}?
                </p>
                <div className="flex space-x-2">
                    <Button color="failure" onClick={onRemoveAllTransactions}>
                        <FaTrashAlt color="white" className="mr-1" />
                        Remove All Transactions
                    </Button>
                    <Button color="dark" onClick={onCloseModals}>Cancel</Button>
                </div>
            </div>
        </Modal>
    </>
);

export default DetailModals;