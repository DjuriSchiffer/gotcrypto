import { Table as FBTable } from "flowbite-react";

const TableHead = ({ type = "dashboard" }) => {
  if (type === "dashboard") {
    return (
      <FBTable.Head>
        <FBTable.HeadCell className="text-left py-2">Name</FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Current Price
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">Holdings</FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Profit/loss
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-right py-2 pr-3">
          Actions
        </FBTable.HeadCell>
      </FBTable.Head>
    );
  }
  if (type === "overview") {
    return (
      <FBTable.Head>
        <FBTable.HeadCell className="text-left py-2 pl-3">
          Amount
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Purchase price
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Purchase Date
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Current Value
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Average Purchase Price
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-left py-2">
          Average Purchase Difference
        </FBTable.HeadCell>
        <FBTable.HeadCell className="text-right py-2 pr-3">
          Actions
        </FBTable.HeadCell>
      </FBTable.Head>
    );
  }
};

const TableBody = ({ type = "dashboard", children }) => {
  return <FBTable.Body className="divide-y">{children}</FBTable.Body>;
};

const Table = ({ type = "dashboard", children }) => {
  return (
    <FBTable striped={true}>
      <TableHead type={type} />
      <TableBody type={type}>{children}</TableBody>
    </FBTable>
  );
};

export default Table;
