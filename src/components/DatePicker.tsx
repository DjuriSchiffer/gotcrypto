import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { formatDatePickerDate } from '../utils/calculateHelpers';
import Datepicker, { DatepickerOptions } from 'tailwind-datepicker-react';

interface DatePickerProps {
  date: string | Date;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const options: DatepickerOptions = {
  title: 'Purchase Date',
  autoHide: true,
  todayBtn: true,
  clearBtn: false,
  maxDate: new Date('2030-01-01'),
  minDate: new Date('1970-01-01'),
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
  language: 'nl',
};

const DatePicker: React.FC<DatePickerProps> = ({ date, handleChange }) => {
  const [show, setShow] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isDatepickerElement = target.closest('[data-te-datepicker-wrapper]') ||
        target.closest('[class*="datepicker"]') ||
        target.closest('[class*="calendar"]') ||
        target.closest('button');

      if (show && isOutsideContainer && !isDatepickerElement) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  const triggerInputChange = (value: string) => {
    const inputElement = inputRef.current;
    if (inputElement) {
      const event = new Event('input', {
        bubbles: true,
      }) as unknown as ChangeEvent<HTMLInputElement>;
      inputElement.value = value;
      inputElement.dispatchEvent(event as any);
      handleChange(event);
    }
  };

  const handleChangeDatePicker = (selectedDate: Date) => {
    const formattedDate = formatDatePickerDate(selectedDate);
    triggerInputChange(formattedDate);
  };

  const handleClose = (state: boolean) => {
    setShow(state);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        setShow(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show]);

  return (
    <div className="w-full" ref={containerRef}>
      <Datepicker
        options={{
          ...options,
          autoHide: true,
        }}
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