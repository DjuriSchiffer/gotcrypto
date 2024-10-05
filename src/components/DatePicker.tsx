// src/components/DatePicker.tsx

import React, { useState, useRef, ChangeEvent } from 'react';
import { formatDatePickerDate } from '../utils/calculateHelpers';
import Datepicker from 'tailwind-datepicker-react';

interface DatePickerProps {
  date: string | Date;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const options = {
  title: 'Purchase Date',
  autoHide: true,
  todayBtn: true,
  clearBtn: false,
  maxDate: new Date('2030-01-01'),
  minDate: new Date('1950-01-01'),
  theme: {
    background: 'bg-gray-700 dark:bg-gray-800',
    todayBtn: 'bg-gray-700',
    clearBtn: '',
    icons: '',
    text: '',
    disabledText: 'bg-gray-900',
    input: '',
    inputIcon: '',
    selected: '',
  },
  icons: {
    prev: () => <span className="text-sm">Previous</span>,
    next: () => <span className="text-sm">Next</span>,
  },
  datepickerClassNames: 'top-12',
  language: 'nl' as const,
};

const DatePicker: React.FC<DatePickerProps> = ({ date, handleChange }) => {
  const [show, setShow] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Triggers a change event on the input element with the new value.
   * @param value - The new date value formatted as a string.
   */
  const triggerInputChange = (value: string) => {
    const inputElement = inputRef.current;
    if (inputElement) {
      const event = new Event('input', {
        bubbles: true,
      }) as unknown as ChangeEvent<HTMLInputElement>;
      inputElement.value = value;
      inputElement.dispatchEvent(event);
      handleChange(event);
    }
  };

  /**
   * Handles the date change from the Datepicker component.
   * @param selectedDate - The date selected from the Datepicker.
   */
  const handleChangeDatePicker = (selectedDate: Date) => {
    const formattedDate = formatDatePickerDate(selectedDate);
    triggerInputChange(formattedDate);
  };

  /**
   * Handles the closing of the Datepicker.
   * @param state - The new visibility state of the Datepicker.
   */
  const handleClose = (state: boolean) => {
    setShow(state);
  };

  return (
    <div className="w-full">
      <Datepicker
        options={options}
        show={show}
        setShow={handleClose}
        onChange={handleChangeDatePicker}
      >
        <input
          id="purchaseDate"
          name="date"
          type="text"
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Select Date"
          value={typeof date === 'string' ? date : formatDatePickerDate(date)}
          onChange={handleChange}
          onFocus={() => setShow(true)}
          readOnly
          required
          ref={inputRef}
        />
      </Datepicker>
    </div>
  );
};

export default DatePicker;
