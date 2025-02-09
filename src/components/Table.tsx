import { Table } from 'flowbite-react';
import { ReactNode } from 'react';

export type TableType = 'dashboard' | 'detail';

interface TableHeadProps {
  type?: TableType;
}

const TableHead: React.FC<TableHeadProps> = ({ type }) => {
  if (type === "dashboard") {
    return (
      <Table.Head>
        <Table.HeadCell className="text-left py-2">Name</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Current Market Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Holdings</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Total invested
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Profit/loss</Table.HeadCell>
        <Table.HeadCell className="text-right py-2 pr-3">
          Edit
        </Table.HeadCell>
      </Table.Head>
    );
  }

  if (type === 'detail') {
    return (
      <Table.Head>
        <Table.HeadCell className="text-left py-2 pl-3">Year</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Type</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Amount</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Current Value
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Average Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Profit
        </Table.HeadCell>
        <Table.HeadCell className="text-right py-2 pr-3">
          Actions
        </Table.HeadCell>
      </Table.Head>
    );
  }
};

interface TableBodyProps {
  children: ReactNode;
}

const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <Table.Body className="divide-y">{children}</Table.Body>;
};

interface TableComponentProps {
  type?: TableType;
  children: ReactNode;
}

const TableComponent: React.FC<TableComponentProps> = ({
  type,
  children,
}) => {
  return (
    <Table striped={true}>
      <TableHead type={type} />
      <TableBody>{children}</TableBody>
    </Table>
  );
};

export default TableComponent;
