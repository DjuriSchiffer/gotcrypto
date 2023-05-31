import { TextInput, Label, Button } from "flowbite-react";
import DatePicker from "./DatePicker";
import Icon from "./Icon";

const AddAssetForm = ({
  onSubmit,
  amount,
  price,
  date,
  handleChange,
  formType,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label
        htmlFor="amount"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Amount
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
          <Icon id={"Amount"} color={"white"} />
        </span>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="0"
          required={true}
          onChange={handleChange}
          value={amount}
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <Icon id={"Price"} color={"white"} />
        </span>
        <input
          id="purchasePrice"
          name="purchasePrice"
          type="number"
          placeholder="0.00"
          step="0.01"
          required={true}
          onChange={handleChange}
          value={parseFloat(price).toFixed(2)}
          className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <Icon id={"Calendar"} color={"white"} />
        </span>
        <DatePicker date={date} handleChange={handleChange} />
      </div>

      <Button type="submit">
        {formType === "add" ? "Add asset" : "Edit asset"}
      </Button>
    </form>
  );
};

export default AddAssetForm;
