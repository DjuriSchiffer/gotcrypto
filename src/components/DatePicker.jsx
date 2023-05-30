import Datepicker from "tailwind-datepicker-react";
import { useState, useRef, useEffect } from "react";
import { formatDatePickerDate } from "../utils/CalculateHelpers";
import Icon from "./Icon";

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
    <div>
      <Datepicker
        options={options}
        show={show}
        setShow={handleClose}
        onChange={handleChangeDatePicker}
      >
        <div className="relative">
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <Icon id={"Calendar"} color={"white"} />
          </div>
          <input
            id="purchasePrice"
            name="date"
            type="date"
            className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg sm:text-md p-4"
            placeholder="Select Date"
            value={date}
            onChange={handleChange}
            onFocus={() => setShow(true)}
            readOnly
            required={true}
            ref={inputRef}
          />
        </div>
      </Datepicker>
    </div>
  );
};

export default DatePicker;
