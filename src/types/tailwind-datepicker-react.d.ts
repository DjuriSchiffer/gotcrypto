declare module 'tailwind-datepicker-react' {
  import type * as React from 'react';

  export type DatepickerOptions = {
    autoHide?: boolean;
    clearBtn?: boolean;
    datepickerClassNames?: string;
    defaultDate?: Date;
    icons?: {
      next?: () => React.ReactNode;
      prev?: () => React.ReactNode;
    };
    language?: string;
    maxDate?: Date;
    minDate?: Date;
    theme?: {
      background?: string;
      clearBtn?: string;
      disabledText?: string;
      icons?: string;
      input?: string;
      inputIcon?: string;
      selected?: string;
      text?: string;
      todayBtn?: string;
    };
    title?: string;
    todayBtn?: boolean;
  }

  export type DatepickerProps = {
    children: React.ReactElement;
    onChange: (selectedDate: Date) => void;
    options: DatepickerOptions;
    setShow: (state: boolean) => void;
    show: boolean;

  }
  
  const Datepicker: React.FC<DatepickerProps>;

  export default Datepicker;
}
