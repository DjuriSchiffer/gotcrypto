// components/AddAssetForm.tsx

import React, { FormEvent, ChangeEvent } from 'react';
import { Button } from 'flowbite-react';
import DatePicker from './DatePicker';
import Icon from './Icon';
import CurrencyInput from 'react-currency-input-field';

interface AddAssetFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  amount: string; // Changed to string to handle partial inputs
  purchasePrice: string;
  date: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  submitLabel: string;
}

const AddAssetForm: React.FC<AddAssetFormProps> = ({
  onSubmit,
  amount,
  purchasePrice,
  date,
  handleChange,
  submitLabel,
}) => {
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(',', '.');

    if (/^\d*\.?\d*$/.test(value)) {
      if (
        value.length > 1 &&
        value.startsWith('0') &&
        !value.startsWith('0.')
      ) {
        value = value.replace(/^0+/, '');
      }

      handleChange({
        target: {
          name: 'amount',
          value,
        },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Amount Input */}
      <label
        htmlFor="amount"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Amount
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <Icon id="Amount" color="white" />
        </span>
        <input
          id="amount"
          name="amount"
          type="text"
          placeholder="e.g., 10.50"
          required
          onChange={handleAmountChange}
          value={amount}
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>

      <label
        htmlFor="purchasePrice"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Purchase Price
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <Icon id="Price" color="white" />
        </span>
        <CurrencyInput
          id="purchasePrice"
          name="purchasePrice"
          onValueChange={(value) => {
            const event = {
              target: { name: 'purchasePrice', value: value || '' },
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(event);
          }}
          required
          placeholder="e.g., 5000.00"
          decimalsLimit={2}
          value={purchasePrice}
          step={0.01}
          decimalSeparator="."
          groupSeparator=","
          allowNegativeValue={false}
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>

      <label
        htmlFor="date"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Purchase Date
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <Icon id="Calendar" color="white" />
        </span>
        <DatePicker date={date} handleChange={handleChange} />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};

export default AddAssetForm;
