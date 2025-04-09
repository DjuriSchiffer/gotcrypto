import type { ReactNode } from 'react';

import { Table } from 'flowbite-react';

export type TableType = 'dashboard' | 'detail';

type TableHeadProps = {
  type?: TableType;
}

function TableHead({ type }: TableHeadProps) {
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
        <Table.HeadCell className="text-left py-2">
          Price
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">Holdings</Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Profit
        </Table.HeadCell>
        <Table.HeadCell className="text-left py-2">
          Description
        </Table.HeadCell>
        <Table.HeadCell className="text-right py-2 pr-3">
          Actions
        </Table.HeadCell>
      </Table.Head>
    );
  }
};

type TableBodyProps = {
  children: ReactNode;
}

function TableBody({ children }: TableBodyProps) {
  return <Table.Body className="divide-y">{children}</Table.Body>;
};

type TableComponentProps = {
  children: ReactNode;
  type?: TableType;
}

function TableComponent({
  children,
  type,
}: TableComponentProps) {
  return (
    <Table striped={true}>
      <TableHead type={type} />
      <TableBody>{children}</TableBody>
    </Table>
  );
};

export default TableComponent;
