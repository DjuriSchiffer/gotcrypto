import type { ReactNode } from 'react';

import { Table } from 'flowbite-react';

export type TableType = 'dashboard' | 'detail';

type TableHeadProps = {
	type?: TableType;
};

function TableHead({ type }: TableHeadProps) {
	if (type === 'dashboard') {
		return (
			<Table.Head>
				<Table.HeadCell className="py-2 text-left">Name</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Current Market Price</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Holdings</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Total invested</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Profit/loss</Table.HeadCell>
				<Table.HeadCell className="py-2 pr-3 text-right">Edit</Table.HeadCell>
			</Table.Head>
		);
	}

	if (type === 'detail') {
		return (
			<Table.Head>
				<Table.HeadCell className="py-2 pl-3 text-left">Year</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Type</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Price</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Holdings</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Profit</Table.HeadCell>
				<Table.HeadCell className="py-2 text-left">Description</Table.HeadCell>
				<Table.HeadCell className="py-2 pr-3 text-right">Actions</Table.HeadCell>
			</Table.Head>
		);
	}
}

type TableBodyProps = {
	children: ReactNode;
};

function TableBody({ children }: TableBodyProps) {
	return <Table.Body className="divide-y">{children}</Table.Body>;
}

type TableComponentProps = {
	children: ReactNode;
	type?: TableType;
};

function TableComponent({ children, type }: TableComponentProps) {
	return (
		<Table striped={true}>
			<TableHead type={type} />
			<TableBody>{children}</TableBody>
		</Table>
	);
}

export default TableComponent;
