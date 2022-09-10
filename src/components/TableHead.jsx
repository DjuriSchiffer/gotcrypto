const TableHead = ({ className, type }) => {
  if (type === "dashboard") {
    return (
      <thead className={className}>
        <tr>
          <th className="text-left py-2 pl-3">Name</th>
          <th className="text-left py-2">Current Price</th>
          <th className="text-left py-2">Holdings</th>
          <th className="text-left py-2">Profit/loss</th>
          <th className="text-right py-2 pr-3">Actions</th>
        </tr>
      </thead>
    );
  }
  if (type === "overview") {
    return (
      <thead className={className}>
        <tr>
          <th className="text-left py-2 pl-3">Amount</th>
          <th className="text-left py-2">Purchase price</th>
          <th className="text-left py-2">Purchase Date</th>
          <th className="text-left py-2">Current Value</th>
          <th className="text-left py-2">Average Purchase Price</th>
          <th className="text-left py-2">Average Purchase Difference</th>
          <th className="text-right py-2 pr-3">Actions</th>
        </tr>
      </thead>
    );
  }
};

export default TableHead;