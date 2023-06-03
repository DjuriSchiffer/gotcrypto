import { Table } from "flowbite-react";

const TableHead = ({ type = "dashboard" }) => {
  if (type === "dashboard") {
    return (
      <Table.Head>
        <Table.HeadCell className="text-left py-2">Name</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Current Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Holdings</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Total invested
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Profit/loss</Table.HeadCell>
        <Table.HeadCell className="text-right py-2 pr-3">
          Actions
        </Table.HeadCell>
      </Table.Head>
    );
  }
  if (type === "overview") {
    return (
      <Table.Head>
        <Table.HeadCell className="text-left py-2 pl-3">Amount</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Purchase price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Purchase Date
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Current Value
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Average Purchase Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Average Purchase Difference
        </Table.HeadCell>
        <Table.HeadCell className="text-right py-2 pr-3">
          Actions
        </Table.HeadCell>
      </Table.Head>
    );
  }
};

const TableBody = ({ type = "dashboard", children }) => {
  return <Table.Body className="divide-y">{children}</Table.Body>;
};

const TableComponent = ({ type = "dashboard", children }) => {
  return (
    <Table striped={true}>
      <TableHead type={type} />
      <TableBody type={type}>{children}</TableBody>
    </Table>
  );
};

export default TableComponent;
