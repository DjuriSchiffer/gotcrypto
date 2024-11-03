import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { dateForDisplay } from '../utils/helpers';
import Datepicker, { DatepickerOptions } from 'tailwind-datepicker-react';

interface DatePickerProps {
  date: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const options: DatepickerOptions = {
  title: 'Purchase Date',
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  maxDate: new Date(),
  minDate: new Date('1970-01-01'),
  theme: {
    background: 'bg-gray-700 dark:bg-gray-800',
    disabledText: 'opacity-50',
  },
  language: 'nl',
};

const DatePicker: React.FC<DatePickerProps> = ({ date, handleChange }) => {
  const [show, setShow] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChangeDatePicker = (selectedDate: Date) => {
    const inputElement = inputRef.current;
    if (inputElement) {
      // Create the event
      const event = new Event('input', { bubbles: true }) as unknown as ChangeEvent<HTMLInputElement>;

      // Create date at UTC midnight for the selected date
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const utcDate = new Date(Date.UTC(year, month, day));

      // Set the value and target
      Object.defineProperty(event, 'target', {
        writable: false,
        value: { ...inputElement, value: utcDate.toISOString() }
      });

      handleChange(event);
    }
  };

  // Outside click handler
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <div className="w-full" ref={containerRef}>
      <Datepicker
        options={{
          ...options,
          autoHide: true,
          defaultDate: new Date(date),
        }}
        show={show}
        setShow={setShow}
        onChange={handleChangeDatePicker}
      >
        <input
          id="purchaseDate"
          name="date"
          type="text"
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Select Date"
          value={dateForDisplay(date)}
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