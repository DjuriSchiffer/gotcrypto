import Datepicker from "tailwind-datepicker-react";
import { useState, useRef } from "react";
import { formatDatePickerDate } from "../utils/CalculateHelpers";

const options = {
  title: "Purchase Date",
  autoHide: true,
  todayBtn: true,
  clearBtn: false,
  maxDate: new Date("2030-01-01"),
  minDate: new Date("1950-01-01"),
  theme: {
    background: "bg-gray-700 dark:bg-gray-800",
    todayBtn: "bg-gray-700",
    clearBtn: "",
    icons: "",
    text: "",
    disabledText: "bg-gray-900",
    input: "",
    inputIcon: "",
    selected: "",
  },
  icons: {
    prev: () => <span className={"text-sm"}>Previous</span>,
    next: () => <span className={"text-sm"}>Next</span>,
  },
  datepickerClassNames: "top-12",
  language: "nl",
};

const DatePicker = ({ date, handleChange }) => {
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);
  const triggerInputChange = (value) => {
    const inputElement = inputRef.current;
    const event = new Event("input", { bubbles: true });
    inputElement.value = value;
    inputElement.dispatchEvent(event);
    handleChange(event);
  };
  const handleChangeDatePicker = (date) => {
    triggerInputChange(formatDatePickerDate(date));
  };
  const handleClose = (state) => {
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
          id="purchasePrice"
          name="date"
          type="date"
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Select Date"
          value={date}
          onChange={handleChange}
          onFocus={() => setShow(true)}
          readOnly
          required={true}
          ref={inputRef}
        />
      </Datepicker>
    </div>
  );
};

export default DatePicker;
