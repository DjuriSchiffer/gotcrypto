import React, { useEffect } from 'react';
import { Button } from 'flowbite-react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from './DatePicker';
import CurrencyInput from 'react-currency-input-field';
import { CurrencyQuote } from 'api';
import { FaCalendar, FaCoins, FaDollarSign, FaEuroSign } from 'react-icons/fa';
import { TransactionType } from 'currency';
import classNames from 'classnames';
import { currencyFormat, dateToStorage, displayToStorage } from '../utils/helpers';
import { useStorage } from '../hooks/useStorage';

const CurrencyFormInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  currencyQuote: keyof CurrencyQuote;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, currencyQuote, placeholder, className }) => {
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
      autoComplete="off"
      data-form-type="other"
      name="transaction-price"
      value={value}
      onValueChange={(value) => {
        if (!value) {
          onChange('');
        } else if (!isNaN(parseFloat(value))) {
          onChange(value);
        }
      }}
      placeholder={placeholder || defaultPlaceholder}
      decimalsLimit={2}
      decimalSeparator={decimalSeparator}
      groupSeparator={groupSeparator}
      allowNegativeValue={false}
      allowDecimals={true}
      className={className}
    />
  );
};

interface FormInputs {
  amount: string;
  purchasePrice: string;
  date: string;
  transactionType: TransactionType;
}

interface TransactionFormProps {
  onSubmit: (data: FormInputs) => void;
  defaultValues?: {
    amount: string;
    purchasePrice: string;
    date: string;
    transactionType: TransactionType;
  };
  submitLabel: string;
  currencyQuote: keyof CurrencyQuote;
  isEdit?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  defaultValues,
  submitLabel,
  currencyQuote,
  isEdit = false,
}) => {
  const { dateLocale } = useStorage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormInputs>({
    defaultValues: {
      amount: '',
      purchasePrice: '',
      date: dateToStorage(new Date()),
      transactionType: 'buy',
    },
  });

  useEffect(() => {
    if (isEdit && defaultValues) {
      const displayAmount = defaultValues.transactionType === 'sell'
        ? Math.abs(parseFloat(defaultValues.amount)).toString()
        : defaultValues.amount;

      reset({
        ...defaultValues,
        amount: displayAmount,
        date: dateToStorage(new Date(defaultValues.date))
      });
    } else if (!isEdit) {
      reset({
        amount: '',
        purchasePrice: '',
        date: dateToStorage(new Date()),
        transactionType: 'buy',
      });
    }
  }, [isEdit, defaultValues, reset]);

  const handleFormSubmit = (data: FormInputs) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Transaction Type
        </label>
        <Controller
          name="transactionType"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Button.Group className='w-full'>
              <Button
                className={classNames('w-6/12', {
                  'opacity-50': value !== 'buy',
                  '!border-blue-400': value === 'buy',
                })}
                color='dark'
                onClick={() => onChange('buy')}
                type="button"
              >
                Buy
              </Button>
              <Button
                className={classNames('w-6/12 border-l', {
                  'opacity-50': value !== 'sell',
                  '!border-blue-400': value === 'sell',
                  '!border-l-[1px]': value === 'sell',
                })}
                color='dark'
                onClick={() => onChange('sell')}
                type="button"
                outline={value === 'buy'}
              >
                Sell
              </Button>
            </Button.Group>
          )}
        />
      </div>
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          Quantity
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            <FaCoins color="white" />
          </span>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'This field is required',
              pattern: {
                value: /^\d*\.?\d*$/,
                message: 'Please enter a valid number',
              },
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num)) return 'Please enter a valid number';
                if (num <= 0) return 'Quantity must be greater than 0';
                return true;
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                autoComplete="off"
                data-form-type="other"
                name="transaction-amount"
                type="text"
                placeholder="10.50"
                onChange={(e) => {
                  let value = e.target.value.replace(',', '.');
                  if (/^\d*\.?\d*$/.test(value)) {
                    if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
                      value = value.replace(/^0+/, '');
                    }
                    field.onChange(value);
                  }
                }}
                className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            )}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="purchasePrice"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <Controller
            name="transactionType"
            control={control}
            render={({ field: { value } }) => (
              <>{value === 'sell' ? 'Sell Price' : 'Purchase Price'}</>
            )}
          />
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            {currencyQuote === 'EUR' ? <FaEuroSign color="white" /> : <FaDollarSign color="white" />}
          </span>
          <Controller
            name="purchasePrice"
            control={control}
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
            render={({ field: { onChange, value, ...field } }) => (
              <CurrencyFormInput
                {...field}
                value={value}
                onChange={onChange}
                currencyQuote={currencyQuote}
                placeholder={currencyFormat(5000.25, currencyQuote)}
                className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            )}
          />
        </div>
        {errors.purchasePrice && (
          <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="purchaseDate"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <Controller
            name="transactionType"
            control={control}
            render={({ field: { value } }) => (
              <>{value === 'sell' ? 'Sell Date' : 'Purchase Date'}</>
            )}
          />
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
            <FaCalendar color="white" />
          </span>
          <Controller
            name="date"
            control={control}
            rules={{
              required: 'This field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                autoComplete="off"
                data-form-type="other"
                name="transaction-date"
                date={value}
                handleChange={(e) => {
                  const isoDate = displayToStorage(e.target.value, dateLocale);
                  onChange(isoDate);
                }}
              />
            )}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form >
  );
};

export default TransactionForm;