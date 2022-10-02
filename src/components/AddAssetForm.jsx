const AddAssetForm = ({
  onSubmit,
  className,
  amount,
  price,
  date,
  handleChange,
  formType
}) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      <label for="amount" className="text-gray text-sm mb-1">
        Amount
      </label>
      <input
        className="text-black mb-3 p-2 shadow-line rounded"
        name="amount"
        type="number"
        placeholder="amount"
        onChange={handleChange}
        value={amount}
        required
      />
      <label for="purchasePrice" className="text-gray text-sm mb-1">
        Purchase Price - in Euros
      </label>
      <input
        className="text-black mb-3 p-2 shadow-line rounded"
        name="purchasePrice"
        type="number"
        placeholder="purchase price"
        onChange={handleChange}
        value={price}
        required
      />
      <label for="date" className="text-gray text-sm mb-1">
        Purchase Date
      </label>
      <input
        className="text-black mb-4 p-2 shadow-line rounded"
        name="date"
        type="date"
        placeholder="date"
        onChange={handleChange}
        value={date}
        required
      />
      <input
        className="bg-green p-4 rounded-md"
        type="submit"
        value={formType === "add" ? "Add asset" : "Edit asset"}
      />
    </form>
  );
};

export default AddAssetForm;
