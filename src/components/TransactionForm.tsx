import type { CurrencyQuote } from 'api';
import type { TransactionType, TransferType } from 'currency';

import classNames from 'classnames';
import { Button } from 'flowbite-react';
import { useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { Controller, useForm } from 'react-hook-form';
import { FaCalendar, FaCoins, FaDollarSign, FaEuroSign } from 'react-icons/fa';

import { useAuth } from '../hooks/useAuth';
import { currencyFormat, dateToStorage, displayToStorage } from '../utils/helpers';
import DatePicker from './DatePicker';

type CurrencyFormInputProps = {
  className?: string;
  currencyQuote: keyof CurrencyQuote;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

function CurrencyFormInput({ className, currencyQuote, onChange, placeholder, value }: CurrencyFormInputProps) {
  const getLocaleConfig = () => {
    if (currencyQuote === 'EUR') {
      return {
        decimalSeparator: ',',
        groupSeparator: '.',
        placeholder: placeholder || '5.000,25'
      };
    }
    return {
      decimalSeparator: '.',
      groupSeparator: ',',
      placeholder: placeholder || '5,000.25'
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
      value={value}
    />
  );
};

export type FormInputs = {
  amount: string;
  date: string;
  description?: string;
  excludeForTax?: boolean;
  purchasePrice: string;
  transactionType: TransactionType;
  transferType?: TransferType;
}

type TransactionFormProps = {
  currencyQuote: keyof CurrencyQuote;
  defaultValues?: {
    amount: string;
    date: string;
    description?: string
    excludeForTax?: boolean;
    purchasePrice: string;
    transactionType: TransactionType;
    transferType?: TransferType;
  };
  isEdit?: boolean;
  onSubmit: (data: FormInputs) => void;
  submitLabel: string;
}

function TransactionForm({
  currencyQuote,
  defaultValues,
  isEdit = false,
  onSubmit,
  submitLabel,
}: TransactionFormProps) {
  const { isAdmin } = useAuth()

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<FormInputs>({
    defaultValues: {
      amount: '',
      date: dateToStorage(new Date()),
      description: '',
      excludeForTax: false,
      purchasePrice: '',
      transactionType: 'buy',
      transferType: 'in',
    },
  });

  const transactionType = watch('transactionType');
  const isTransfer = transactionType === 'transfer';

  useEffect(() => {
    if (isEdit && defaultValues) {
      const displayAmount = defaultValues.transactionType === 'sell' || (isTransfer && defaultValues.transferType === 'out')
        ? Math.abs(parseFloat(defaultValues.amount)).toString()
        : defaultValues.amount;

      const displayPurchasePrise = defaultValues.transactionType === 'sell' || (isTransfer && defaultValues.transferType === 'out')
        ? Math.abs(parseFloat(defaultValues.purchasePrice)).toFixed(2).toString()
        : parseFloat(defaultValues.purchasePrice).toFixed(2);

      reset({
        ...defaultValues,
        amount: displayAmount,
        date: dateToStorage(new Date(defaultValues.date)),
        description: defaultValues.description || '',
        excludeForTax: defaultValues.excludeForTax ?? false,
        purchasePrice: displayPurchasePrise,
        transferType: defaultValues.transferType || 'in'
      });
    } else if (!isEdit) {
      reset({
        amount: '',
        date: dateToStorage(new Date()),
        description: '',
        excludeForTax: false,
        purchasePrice: '',
        transactionType: 'buy',
        transferType: 'in',
      });
    }
  }, [isEdit, defaultValues, reset, isTransfer]);

  const handleFormSubmit = (data: FormInputs) => {
    onSubmit(data);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={() => void handleSubmit(handleFormSubmit)}>
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Transaction Type
        </label>
        <Controller
          control={control}
          name="transactionType"
          render={({ field: { onChange, value } }) => (
            <Button.Group className='w-full'>
              <Button
                className={classNames('w-4/12', {
                  '!border-blue-400': value === 'buy',
                  'opacity-50': value !== 'buy',
                })}
                color='dark'
                onClick={() => { onChange('buy'); }}
                type="button"
              >
                Buy
              </Button>
              <Button
                className={classNames('w-4/12 border-l', {
                  '!border-blue-400': value === 'sell',
                  '!border-l-[1px]': value === 'sell',
                  'opacity-50': value !== 'sell',
                })}
                color='dark'
                onClick={() => { onChange('sell'); }}
                outline={value === 'buy'}
                type="button"
              >
                Sell
              </Button>
              <Button
                className={classNames('w-4/12 border-l', {
                  '!border-blue-400': value === 'transfer',
                  '!border-l-[1px]': value === 'transfer',
                  'opacity-50': value !== 'transfer',
                })}
                color='dark'
                onClick={() => { onChange('transfer'); }}
                outline={value === 'buy'}
                type="button"
              >
                Transfer
              </Button>
            </Button.Group>
          )}
        />
      </div>
      {isTransfer && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      id="transfer-type-in"
                      onChange={() => { onChange('in'); }}
                      type="radio"
                    />
                    <label
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                      htmlFor="transfer-type-in"
                    >
                      Transfer In
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      checked={value === 'out'}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      id="transfer-type-out"
                      onChange={() => { onChange('out'); }}
                      type="radio"
                    />
                    <label
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
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
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          htmlFor="amount"
        >
          Quantity
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            <FaCoins color="white" />
          </span>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <input
                {...field}
                autoComplete="off"
                className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          htmlFor="purchasePrice"
        >
          <Controller
            control={control}
            name="transactionType"
            render={({ field: { value } }) => (
              <>{value === 'sell' ? 'Sell Price' : value === 'buy' ? 'Purchase Price' : 'Transfer value'}</>
            )}
          />
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            {currencyQuote === 'EUR' ? <FaEuroSign color="white" /> : <FaDollarSign color="white" />}
          </span>
          <Controller
            control={control}
            name="purchasePrice"
            render={({ field: { onChange, value, ...field } }) => (
              <CurrencyFormInput
                {...field}
                className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                currencyQuote={currencyQuote}
                onChange={onChange}
                placeholder={currencyFormat(5000.25, currencyQuote)}
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
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          htmlFor="purchaseDate"
        >
          <Controller
            control={control}
            name="transactionType"
            render={({ field: { value } }) => (
              <>{value === 'sell' ? 'Sell Date' : value === 'buy' ? 'Purchase Date' : 'Transfer Date'}</>
            )}
          />
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            <FaCalendar color="white" />
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
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
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
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={isTransfer ? "e.g., Transferred to hardware wallet" : "e.g., DCA purchase"}
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  id="excludeForTax"
                  onChange={(e) => { onChange(e.target.checked); }}
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
      <Button type="submit">{submitLabel}</Button>
    </form >
  );
};

export default TransactionForm;