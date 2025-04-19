import type { ReactNode } from 'react';

import {
	Table,
	TableHead as FBTableHead,
	TableHeadCell,
	TableBody as FBTableBody,
} from 'flowbite-react';

export type TableType = 'dashboard' | 'detail';

type TableHeadProps = {
	type?: TableType;
};

function TableHead({ type }: TableHeadProps) {
	if (type === 'dashboard') {
		return (
			<FBTableHead>
				<TableHeadCell className="py-2 text-left">Name</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Current Market Price</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Holdings</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Total invested</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Profit/loss</TableHeadCell>
				<TableHeadCell className="py-2 pr-3 text-right">Edit</TableHeadCell>
			</FBTableHead>
		);
	}

	if (type === 'detail') {
		return (
			<FBTableHead>
				<TableHeadCell className="py-2 pl-3 text-left">Year</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Type</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Price</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Holdings</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Profit</TableHeadCell>
				<TableHeadCell className="py-2 text-left">Description</TableHeadCell>
				<TableHeadCell className="py-2 pr-3 text-right">Actions</TableHeadCell>
			</FBTableHead>
		);
	}
}

type TableBodyProps = {
	children: ReactNode;
};

function TableBody({ children }: TableBodyProps) {
	return <FBTableBody className="divide-y">{children}</FBTableBody>;
}

type TableComponentProps = {
	children: ReactNode;
	type?: TableType;
};

function TableComponent({ children, type }: TableComponentProps) {
	return (
		<div className="overflow-x-auto">
			<Table striped={true}>
				<TableHead type={type} />
				<TableBody>{children}</TableBody>
			</Table>
		</div>
	);
}

export default TableComponent;
