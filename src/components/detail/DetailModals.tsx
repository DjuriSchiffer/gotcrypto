import type { CurrencyQuote } from 'api';

import type { Transaction } from '../../types/currency';
import type { FormInputs } from '../TransactionForm';

import Modal from '../Modal';
import TransactionForm from '../TransactionForm';
import ConfirmModal from '../ui/ConfirmModal';

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
	/** Number of transactions, shown when removing all of them */
	transactionCount?: number;
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
	transactionCount = 0,
}: DetailModalsProps) {
	return (
		<>
			<Modal onClose={onCloseModals} open={openAddTransactionModal} title="Add transaction">
				<TransactionForm
					currencyQuote={currencyQuote}
					isEdit={false}
					key={`add-form-${String(openAddTransactionModal)}`}
					onSubmit={onFormSubmit}
					submitLabel="Add Transaction"
				/>
			</Modal>

			<Modal onClose={onCloseModals} open={openEditTransactionModal} title="Edit transaction">
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

			<ConfirmModal
				confirmLabel="Remove transaction"
				message="This removes the transaction and recalculates your holdings and profit."
				onClose={onCloseModals}
				onConfirm={onRemoveTransaction}
				open={openRemoveTransactionModal}
				title="Remove this transaction?"
			/>

			<ConfirmModal
				confirmLabel="Remove all transactions"
				message={
					<>
						This permanently removes{' '}
						<strong>
							all {transactionCount} {selectedAssetName} transactions
						</strong>
						. The asset stays on your dashboard. This can't be undone.
					</>
				}
				onClose={onCloseModals}
				onConfirm={onRemoveAllTransactions}
				open={openRemoveAllTransactionsModal}
				requireText="DELETE"
				title={`Remove all ${selectedAssetName ?? ''} transactions?`}
			/>
		</>
	);
}

export default DetailModals;
