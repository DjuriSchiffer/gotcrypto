import type { CurrencyQuote } from 'api';

import { Button, useThemeMode } from 'flowbite-react';
import { FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';

import type { Transaction } from '../types/currency';
import type { FormInputs } from './TransactionForm';

import Modal from '../components/Modal';
import TransactionForm from './TransactionForm';

type DetailModalsProps = {
	currencyQuote: keyof CurrencyQuote;
	currentTransaction: null | Transaction;
	onCloseModals: () => void;
	onFormSubmit: (formData: FormInputs) => void;
	onRemoveAllTransactions: () => void;
	onRemoveTransaction: () => void;
	openAddTransactionModal: boolean;
	openEditTransactionModal: boolean;
	openRemoveAllTransactionsModal: boolean;
	openRemoveTransactionModal: boolean;
	selectedAssetName?: string;
};

function DetailModals({
	currencyQuote,
	currentTransaction,
	onCloseModals,
	onFormSubmit,
	onRemoveAllTransactions,
	onRemoveTransaction,
	openAddTransactionModal,
	openEditTransactionModal,
	openRemoveAllTransactionsModal,
	openRemoveTransactionModal,
	selectedAssetName,
}: DetailModalsProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';

	return (
		<>
			<Modal onClose={onCloseModals} open={openAddTransactionModal} title="Add Transaction">
				<TransactionForm
					currencyQuote={currencyQuote}
					isEdit={false}
					key={`add-form-${String(openAddTransactionModal)}`}
					onSubmit={onFormSubmit}
					submitLabel="Add Transaction"
				/>
			</Modal>

			<Modal onClose={onCloseModals} open={openEditTransactionModal} title="Edit Transaction">
				<TransactionForm
					currencyQuote={currencyQuote}
					defaultValues={
						currentTransaction
							? {
									amount: currentTransaction.amount,
									date: currentTransaction.date,
									description: currentTransaction.description,
									excludeForTax: currentTransaction.excludeForTax,
									purchasePrice: currentTransaction.purchasePrice,
									transactionType: currentTransaction.type,
									transferType: currentTransaction.transferType,
								}
							: undefined
					}
					isEdit={true}
					key={`edit-form-${String(openEditTransactionModal)}-${String(currentTransaction?.id)}`}
					onSubmit={onFormSubmit}
					submitLabel="Update Transaction"
				/>
			</Modal>

			<Modal onClose={onCloseModals} open={openRemoveTransactionModal} title="Confirm Removal">
				<div className="flex flex-col items-center">
					<FaExclamationTriangle
						className="mx-auto mb-4 flex text-6xl"
						color={isDarkMode ? 'white' : 'dark'}
					/>
					<p className="mb-4 text-dark dark:text-white">
						Are you sure you want to remove this transaction?
					</p>
					<div className="flex space-x-2">
						<Button color="failure" onClick={onRemoveTransaction}>
							<FaTrashAlt className="mr-1" color="white" />
							Remove Transaction
						</Button>
						<Button color="dark" onClick={onCloseModals}>
							Cancel
						</Button>
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
						className="mx-auto mb-4 flex text-6xl"
						color={isDarkMode ? 'white' : 'dark'}
					/>
					<p className="mb-4 text-dark dark:text-white">
						Are you sure you want to remove all transactions for {selectedAssetName}?
					</p>
					<div className="flex space-x-2">
						<Button color="failure" onClick={onRemoveAllTransactions}>
							<FaTrashAlt className="mr-1" color="white" />
							Remove All Transactions
						</Button>
						<Button color="dark" onClick={onCloseModals}>
							Cancel
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DetailModals;
