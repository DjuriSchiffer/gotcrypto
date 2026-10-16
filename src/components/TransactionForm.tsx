import type { CurrencyQuote } from 'api';
import type { TransactionType, TransferType } from 'currency';

import classNames from 'classnames';
import { Button, ButtonGroup, useThemeMode } from 'flowbite-react';
import { forwardRef } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { Controller, useForm } from 'react-hook-form';
import { FaCalendar, FaCoins, FaDollarSign, FaEuroSign } from 'react-icons/fa';

import type { PriceLookupCoin } from './PriceSuggestion';

import { useAuth } from '../hooks/useAuth';
import { currencyFormat, dateToStorage, displayToStorage } from '../utils/helpers';
import DatePicker from './DatePicker';
import PriceSuggestion from './PriceSuggestion';

type CurrencyFormInputProps = {
	className?: string;
	currencyQuote: keyof CurrencyQuote;
	onChange: (value: string) => void;
	placeholder?: string;
	value: string;
};

const CurrencyFormInput = forwardRef<HTMLInputElement, CurrencyFormInputProps>(
	({ className, currencyQuote, onChange, placeholder, value }, ref) => {
		const getLocaleConfig = () => {
			if (currencyQuote === 'EUR') {
				return {
					decimalSeparator: ',',
					groupSeparator: '.',
					placeholder: placeholder || '5.000,25',
				};
			}
			return {
				decimalSeparator: '.',
				groupSeparator: ',',
				placeholder: placeholder || '5,000.25',
			};
		};

		const { decimalSeparator, groupSeparator, placeholder: defaultPlaceholder } = getLocaleConfig();

		return (
			<CurrencyInput
				allowDecimals={true}
				allowNegativeValue={false}
				autoComplete="off"
				className={className}
				data-form-type="other"
				decimalSeparator={decimalSeparator}
				decimalsLimit={2}
				groupSeparator={groupSeparator}
				name="transaction-price"
				onValueChange={(value) => {
					if (!value) {
						onChange('');
					} else if (!isNaN(parseFloat(value))) {
						onChange(value);
					}
				}}
				placeholder={placeholder || defaultPlaceholder}
				ref={ref}
				value={value}
			/>
		);
	}
);

CurrencyFormInput.displayName = 'CurrencyFormInput';

export type FormInputs = {
	amount: string;
	date: string;
	description?: string;
	excludeForTax?: boolean;
	purchasePrice: string;
	transactionType: TransactionType;
	transferType?: TransferType;
};

type TransactionFormProps = {
	currencyQuote: keyof CurrencyQuote;
	defaultValues?: {
		amount: string;
		date: string;
		description?: string;
		excludeForTax?: boolean;
		purchasePrice: string;
		transactionType: TransactionType;
		transferType?: TransferType;
	};
	isEdit?: boolean;
	onSubmit: (data: FormInputs) => void;
	priceLookup?: PriceLookupCoin;
	submitLabel: string;
};

const initialFormValues = (transaction?: TransactionFormProps['defaultValues']): FormInputs => {
	if (!transaction) {
		return {
			amount: '',
			date: dateToStorage(new Date()),
			description: '',
			excludeForTax: false,
			purchasePrice: '',
			transactionType: 'buy',
			transferType: 'in',
		};
	}

	const price = parseFloat(transaction.purchasePrice);

	return {
		...transaction,
		amount: String(Math.abs(parseFloat(transaction.amount))),
		date: dateToStorage(transaction.date),
		description: transaction.description ?? '',
		excludeForTax: transaction.excludeForTax ?? false,
		purchasePrice: Number.isFinite(price) ? Math.abs(price).toFixed(2) : '',
		transferType: transaction.transferType ?? 'in',
	};
};

function TransactionForm({
	currencyQuote,
	defaultValues,
	isEdit = false,
	onSubmit,
	priceLookup,
	submitLabel,
}: TransactionFormProps) {
	const { isAdmin } = useAuth();
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';

	// Starting values are read once, when the form opens. The modals open a fresh form each time,
	// so nothing has to reset it later (an effect that did reset it also undid clicking "Transfer")
	const {
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		watch,
	} = useForm<FormInputs>({ defaultValues: initialFormValues(isEdit ? defaultValues : undefined) });

	const transactionType = watch('transactionType');
	const isTransfer = transactionType === 'transfer';
	const [amount, date, purchasePrice] = watch(['amount', 'date', 'purchasePrice']);

	const handleFormSubmit = (data: FormInputs) => {
		onSubmit(data);
	};

	const getButtonStyles = (buttonType: TransactionType, currentValue: string) => {
		const isActive = buttonType === currentValue;

		return isActive
			? 'bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-dark dark:hover:bg-gray-900 dark:text-white'
			: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200';
	};

	return (
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
			<div>
				<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					Transaction Type
				</label>
				<Controller
					control={control}
					name="transactionType"
					render={({ field: { onChange, value } }) => (
						<ButtonGroup className="w-full">
							<Button
								className={classNames('w-4/12 !border-0', getButtonStyles('buy', value), {
									'!first:border-l-0': true,
									'!rounded-l-lg': true,
									'z-10 !border-[1px] !border-primary-400 dark:!border-primary-500':
										value === 'buy',
								})}
								color="gray"
								onClick={() => {
									onChange('buy');
								}}
								type="button"
							>
								Buy
							</Button>
							<Button
								className={classNames('w-4/12 !border-0', getButtonStyles('sell', value), {
									'!rounded-none': true,
									'z-10 !border-[1px] !border-primary-400 dark:!border-primary-500':
										value === 'sell',
								})}
								color="gray"
								onClick={() => {
									onChange('sell');
								}}
								type="button"
							>
								Sell
							</Button>
							<Button
								className={classNames('w-4/12 !border-0', getButtonStyles('transfer', value), {
									'!rounded-r-lg': true,
									'z-10 !border-[1px] !border-primary-400 dark:!border-primary-500':
										value === 'transfer',
								})}
								color="gray"
								onClick={() => {
									onChange('transfer');
								}}
								type="button"
							>
								Transfer
							</Button>
						</ButtonGroup>
					)}
				/>
			</div>
			{isTransfer && (
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
						Transfer Direction
					</label>
					<div className="flex items-center space-x-4">
						<Controller
							control={control}
							name="transferType"
							render={({ field: { onChange, value } }) => (
								<>
									<div className="flex items-center">
										<input
											checked={value === 'in'}
											className="h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
											id="transfer-type-in"
											onChange={() => {
												onChange('in');
											}}
											type="radio"
										/>
										<label
											className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
											htmlFor="transfer-type-in"
										>
											Transfer In
										</label>
									</div>
									<div className="flex items-center">
										<input
											checked={value === 'out'}
											className="h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
											id="transfer-type-out"
											onChange={() => {
												onChange('out');
											}}
											type="radio"
										/>
										<label
											className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
											htmlFor="transfer-type-out"
										>
											Transfer Out
										</label>
									</div>
								</>
							)}
							rules={{ required: 'Please select a transfer direction' }}
						/>
					</div>
					{errors.transferType && (
						<p className="mt-1 text-sm text-red-600">{errors.transferType.message}</p>
					)}
				</div>
			)}
			<div>
				<label
					className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					htmlFor="amount"
				>
					Quantity
				</label>
				<div className="flex">
					<span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
						<FaCoins color={isDarkMode ? 'white' : 'dark'} />
					</span>
					<Controller
						control={control}
						name="amount"
						render={({ field }) => (
							<input
								{...field}
								autoComplete="off"
								className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
								data-form-type="other"
								name="transaction-amount"
								onChange={(e) => {
									let value = e.target.value.replace(',', '.');
									if (/^\d*\.?\d*$/.test(value)) {
										if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
											value = value.replace(/^0+/, '');
										}
										field.onChange(value);
									}
								}}
								placeholder="10.50"
								type="text"
							/>
						)}
						rules={{
							pattern: {
								message: 'Please enter a valid number',
								value: /^\d*\.?\d*$/,
							},
							required: 'This field is required',
							validate: (value) => {
								const num = parseFloat(value);
								if (isNaN(num)) return 'Please enter a valid number';
								if (num <= 0) return 'Quantity must be greater than 0';
								return true;
							},
						}}
					/>
				</div>
				{errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
			</div>

			<div>
				<label
					className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					htmlFor="purchaseDate"
				>
					<Controller
						control={control}
						name="transactionType"
						render={({ field: { value } }) => (
							<>
								{value === 'sell'
									? 'Sell Date'
									: value === 'buy'
										? 'Purchase Date'
										: 'Transfer Date'}
							</>
						)}
					/>
				</label>
				<div className="flex">
					<span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
						<FaCalendar color={isDarkMode ? 'white' : 'dark'} />
					</span>
					<Controller
						control={control}
						name="date"
						render={({ field: { onChange, value } }) => (
							<DatePicker
								autoComplete="off"
								data-form-type="other"
								date={value}
								handleChange={(e) => {
									const isoDate = displayToStorage(e.target.value);
									onChange(isoDate);
								}}
								name="transaction-date"
							/>
						)}
						rules={{
							required: 'This field is required',
						}}
					/>
				</div>
				{errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
			</div>
			<div>
				<label
					className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					htmlFor="purchasePrice"
				>
					<Controller
						control={control}
						name="transactionType"
						render={({ field: { value } }) => (
							<>
								{value === 'sell'
									? 'Sell Price'
									: value === 'buy'
										? 'Purchase Price'
										: 'Transfer value'}
							</>
						)}
					/>
				</label>
				<div className="flex">
					<span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
						{currencyQuote === 'EUR' ? (
							<FaEuroSign color={isDarkMode ? 'white' : 'dark'} />
						) : (
							<FaDollarSign color={isDarkMode ? 'white' : 'dark'} />
						)}
					</span>
					<Controller
						control={control}
						name="purchasePrice"
						render={({ field: { onChange, value, ...field } }) => (
							<CurrencyFormInput
								{...field}
								className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
								currencyQuote={currencyQuote}
								onChange={onChange}
								placeholder={currencyFormat(5000.25, currencyQuote)}
								ref={field.ref}
								value={value}
							/>
						)}
						rules={{
							required: 'This field is required',
							validate: (value) => {
								const normalizedValue = value.replace(',', '.');
								const num = parseFloat(normalizedValue);
								if (isNaN(num)) return 'Please enter a valid number';
								if (num <= 0) return 'Price must be greater than 0';
								return true;
							},
						}}
					/>
				</div>
				{errors.purchasePrice && (
					<p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
				)}
				{priceLookup && (
					<PriceSuggestion
						amount={amount}
						coin={priceLookup}
						currencyQuote={currencyQuote}
						date={date}
						enteredTotal={purchasePrice}
						onUse={(total) => {
							setValue('purchasePrice', total.toFixed(2), {
								shouldDirty: true,
								shouldValidate: true,
							});
						}}
					/>
				)}
			</div>
			<div>
				<label
					className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					htmlFor="description"
				>
					Description (optional)
				</label>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value, ...restField } }) => (
						<textarea
							onChange={onChange}
							value={value}
							{...restField}
							className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
							placeholder={
								isTransfer ? 'e.g., Transferred to hardware wallet' : 'e.g., DCA purchase'
							}
							rows={2}
						/>
					)}
				/>
			</div>
			{isAdmin && (
				<div className="flex items-center">
					<Controller
						control={control}
						name="excludeForTax"
						render={({ field: { onChange, value, ...field } }) => (
							<>
								<input
									{...field}
									checked={value}
									className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600 dark:focus:ring-offset-gray-800"
									id="excludeForTax"
									onChange={(e) => {
										onChange(e.target.checked);
									}}
									type="checkbox"
								/>
								<label
									className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
									htmlFor="excludeForTax"
								>
									Exclude for tax calculations
								</label>
							</>
						)}
					/>
				</div>
			)}
			<Button color="primary" type="submit">
				{submitLabel}
			</Button>
		</form>
	);
}

export default TransactionForm;
