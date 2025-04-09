import type { ChangeEvent } from 'react';
import type { DatepickerOptions } from 'tailwind-datepicker-react';

import { useEffect, useRef, useState } from 'react';
import Datepicker from 'tailwind-datepicker-react';

import { useStorage } from '../hooks/useStorage';
import { dateForDisplay } from '../utils/helpers';

type DatePickerProps = {
  autoComplete: string,
  'data-form-type': string
  date: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string
}

const options: DatepickerOptions = {
  autoHide: true,
  clearBtn: true,
  language: 'nl',
  maxDate: new Date(),
  minDate: new Date('1970-01-01'),
  theme: {
    background: 'bg-gray-700 dark:bg-gray-800',
    disabledText: 'opacity-50',
  },
  title: 'Purchase Date',
  todayBtn: false,
};

function DatePicker({ date, handleChange }: DatePickerProps) {
  const { dateLocale } = useStorage();
  const [show, setShow] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChangeDatePicker = (selectedDate: Date) => {
    const inputElement = inputRef.current;
    if (inputElement) {
      const event = new Event('input', { bubbles: true }) as unknown as ChangeEvent<HTMLInputElement>;

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const utcDate = new Date(Date.UTC(year, month, day));

      Object.defineProperty(event, 'target', {
        value: {
          id: inputElement.id,
          name: inputElement.name,
          type: inputElement.type,
          value: utcDate.toISOString()
        },
        writable: false
      });

      handleChange(event);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isDatepickerElement = target.closest('[data-te-datepicker-wrapper]') ??
        target.closest('[class*="datepicker"]') ??
        target.closest('[class*="calendar"]') ??
        target.closest('button');

      if (show && isOutsideContainer && !isDatepickerElement) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [show]);

  return (
    <div className="w-full" ref={containerRef}>
      <Datepicker
        onChange={handleChangeDatePicker}
        options={{
          ...options,
          autoHide: true,
          defaultDate: new Date(date),
        }}
        setShow={setShow}
        show={show}
      >
        <input
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          id="purchaseDate"
          name="date"
          onChange={handleChange}
          onFocus={() => { setShow(true); }}
          placeholder="Select Date"
          readOnly
          ref={inputRef}
          required
          type="text"
          value={dateForDisplay(date, dateLocale)}
        />
      </Datepicker>
    </div>
  );
};

export default DatePicker;