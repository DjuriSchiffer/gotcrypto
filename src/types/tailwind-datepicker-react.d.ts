declare module 'tailwind-datepicker-react' {
  import * as React from 'react';

  export interface DatepickerOptions {
    title?: string;
    autoHide?: boolean;
    todayBtn?: boolean;
    clearBtn?: boolean;
    maxDate?: Date;
    minDate?: Date;
    theme?: {
      background?: string;
      todayBtn?: string;
      clearBtn?: string;
      icons?: string;
      text?: string;
      disabledText?: string;
      input?: string;
      inputIcon?: string;
      selected?: string;
    };
    icons?: {
      prev?: () => React.ReactNode;
      next?: () => React.ReactNode;
    };
    datepickerClassNames?: string;
    language?: string;
  }

  export interface DatepickerProps {
    options: DatepickerOptions;
    show: boolean;
    setShow: (state: boolean) => void;
    onChange: (selectedDate: Date) => void;
    children: React.ReactElement;
  }

  // Export the Datepicker component
  const Datepicker: React.FC<DatepickerProps>;

  export default Datepicker;
}
