import { TextInput, Label, Button } from "flowbite-react";
import Icon from "./Icon";

const AddAssetForm = ({
  onSubmit,
  className,
  amount,
  price,
  date,
  handleChange,
  formType,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <div className="mb-2 block">
          <Label htmlFor="amount" value="Amount" />
        </div>
        <TextInput
          id="amount"
          type="number"
          placeholder="0"
          required={true}
          onChange={handleChange}
          value={amount}
          sizing="lg"
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="purchasePrice" value=" Purchase Price - in Euros" />
        </div>
        <TextInput
          id="purchasePrice"
          name="purchasePrice"
          type="number"
          placeholder="0"
          required={true}
          onChange={handleChange}
          value={price}
          sizing="lg"
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="date" value="Purchase Date" />
        </div>
        <TextInput
          id="purchasePrice"
          name="date"
          type="date"
          placeholder="date"
          required={true}
          onChange={handleChange}
          value={date}
          sizing="lg"
        />
      </div>
      <Button type="submit">
        {formType === "add" ? "Add asset" : "Edit asset"}
      </Button>
    </form>
  );
};

export default AddAssetForm;
