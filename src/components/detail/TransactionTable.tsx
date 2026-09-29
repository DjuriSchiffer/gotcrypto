import type { CurrencyQuote } from 'api';
import type { Transaction } from 'currency';

import classNames from 'classnames';
import {
	Badge,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
	Tooltip,
} from 'flowbite-react';
import { useMemo } from 'react';
import { FaCommentAlt, FaPen, FaTrashAlt } from 'react-icons/fa';

import type { TransactionRow } from '../../utils/transactions';

import { useAppState } from '../../hooks/useAppState';
import { amountFormat, currencyFormat, dateForDisplay, profitClass } from '../../utils/helpers';
import { getTransactionYears } from '../../utils/transactions';
import ProfitBadge from '../ui/ProfitBadge';

const TYPE_BADGES: Record<string, { color: string; label: string }> = {
	buy: { color: 'success', label: 'Buy' },
	sell: { color: 'failure', label: 'Sell' },
	'transfer-in': { color: 'indigo', label: 'Transfer in' },
	'transfer-out': { color: 'gray', label: 'Transfer out' },
};

const typeKey = (transaction: Transaction) =>
	transaction.type === 'transfer'
		? `transfer-${transaction.transferType ?? 'in'}`
		: transaction.type;

type TransactionTableProps = {
	currencyQuote: keyof CurrencyQuote;
	currentPrice: number;
	onEdit: (transaction: Transaction) => void;
	onRemove: (transaction: Transaction) => void;
	transactions: Array<Transaction>;
};

function TransactionTable({
	currencyQuote,
	currentPrice,
	onEdit,
	onRemove,
	transactions,
}: TransactionTableProps) {
	const { dateLocale } = useAppState();
	const years = useMemo(
		() => getTransactionYears(transactions, currentPrice),
		[transactions, currentPrice]
	);

	const money = (value: number) => currencyFormat(value, currencyQuote);

	const renderResult = (row: TransactionRow) => {
		if (row.unrealizedPercentage !== null) {
			return <ProfitBadge percentage={row.unrealizedPercentage} />;
		}
		if (row.realizedProfit !== null) {
			return (
				<div className="flex flex-col items-end">
					<span className={classNames('text-sm font-medium', profitClass(row.realizedProfit))}>
						{row.realizedProfit > 0 ? '+' : ''}
						{money(row.realizedProfit)}
					</span>
					{row.costOfSold !== null && (
						<span className="text-xs text-gray-500 dark:text-gray-400">
							cost {money(row.costOfSold)}
						</span>
					)}
				</div>
			);
		}
		return <span className="text-gray-400">–</span>;
	};

	return (
		<div className="overflow-x-auto">
			<Table hoverable>
				<TableHead>
					<TableHeadCell>Date</TableHeadCell>
					<TableHeadCell>Type</TableHeadCell>
					<TableHeadCell className="text-right">Amount</TableHeadCell>
					<TableHeadCell className="text-right">Total</TableHeadCell>
					<TableHeadCell>
						<div className="flex justify-end">
							<Tooltip content="Buys: change since buying, at today's price. Sells: profit or loss locked in.">
								<span className="cursor-help underline decoration-dotted underline-offset-4">
									Result
								</span>
							</Tooltip>
						</div>
					</TableHeadCell>
					<TableHeadCell className="text-right">Actions</TableHeadCell>
				</TableHead>
				<TableBody className="divide-y">
					{years.map(({ rows, year }) => [
						<TableRow className="bg-gray-50 dark:bg-gray-700" key={`year-${year}`}>
							<TableCell
								className="py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300"
								colSpan={6}
							>
								{year}
							</TableCell>
						</TableRow>,
						...rows.map((row) => {
							const { transaction } = row;
							const badge = TYPE_BADGES[typeKey(transaction)];
							const date = dateForDisplay(transaction.date, dateLocale);

							return (
								<TableRow
									className="bg-white dark:border-gray-700 dark:bg-gray-800"
									key={transaction.id}
								>
									<TableCell className="whitespace-nowrap text-gray-900 dark:text-white">
										{date}
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap items-center gap-1.5">
											<Badge className="w-fit" color={badge.color}>
												{badge.label}
											</Badge>
											{transaction.excludeForTax && (
												<Tooltip content="Excluded from tax calculations">
													<Badge color="warning" size="xs">
														Tax excl.
													</Badge>
												</Tooltip>
											)}
											{transaction.description && (
												<Tooltip content={transaction.description}>
													<FaCommentAlt
														aria-label={`Note: ${transaction.description}`}
														className="h-3 w-3 cursor-help text-gray-400"
													/>
												</Tooltip>
											)}
										</div>
									</TableCell>
									<TableCell
										className={classNames('whitespace-nowrap text-right font-medium', {
											'text-gray-900 dark:text-white': row.amount >= 0,
										})}
									>
										{row.amount > 0 ? '+' : ''}
										{amountFormat(row.amount, currencyQuote)}
									</TableCell>
									<TableCell className="whitespace-nowrap text-right">
										<div className="flex flex-col items-end">
											<span className="text-gray-900 dark:text-white">
												{money(parseFloat(transaction.purchasePrice) || 0)}
											</span>
											<span className="text-xs">{money(row.pricePerCoin)} / coin</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex justify-end">{renderResult(row)}</div>
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">
											<Button
												aria-label={`Edit transaction of ${date}`}
												color="gray"
												onClick={() => onEdit(transaction)}
												size="xs"
											>
												<FaPen />
											</Button>
											<Button
												aria-label={`Remove transaction of ${date}`}
												color="gray"
												onClick={() => onRemove(transaction)}
												size="xs"
											>
												<FaTrashAlt />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						}),
					])}
				</TableBody>
			</Table>
		</div>
	);
}

export default TransactionTable;
