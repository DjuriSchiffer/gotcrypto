import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, TableCell, TableRow } from 'flowbite-react';
import { FaPen, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { amountFormat, currencyFormat, percentageFormat, profitClass } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getAssetSummary } from '../utils/totals';

type DashboardTableRowProps = {
	asset?: SelectedAsset;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	onAddTransaction: () => void;
};

const cellClass = 'py-2 text-gray-700 dark:text-white';

function DashboardTableRow({
	asset,
	currencyQuote,
	fetchedCurrency,
	onAddTransaction,
}: DashboardTableRowProps) {
	const hasTransactions = (asset?.transactions.length ?? 0) > 0;
	const summary = getAssetSummary(asset, fetchedCurrency.price);
	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
		<TableRow className={classNames('transition ease-in-out dark:!border-gray-400')}>
			<TableCell className="whitespace-nowrap text-gray-700 dark:text-white">
				<div className="flex items-center">
					<img
						alt={`${fetchedCurrency.name} icon`}
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
					<div className="pl-2">{fetchedCurrency.name}</div>
				</div>
			</TableCell>

			<TableCell className={cellClass}>{money(fetchedCurrency.price)}</TableCell>

			{!hasTransactions && (
				<>
					<TableCell />
					<TableCell />
					<TableCell />
					<TableCell className="py-2 pr-2 text-right">
						<Button
							color="primary"
							onClick={onAddTransaction}
							size="xs"
							className="ml-auto inline-flex"
						>
							<FaPlus />
							Add first transaction
						</Button>
					</TableCell>
				</>
			)}

			{hasTransactions && (
				<>
					<TableCell className={cellClass}>
						{summary.isClosed ? (
							<span className="text-sm text-gray-500 dark:text-gray-400">Position closed</span>
						) : (
							<div className="flex flex-col">
								<span>{money(summary.value)}</span>
								<span className="text-sm">{amountFormat(summary.amount, currencyQuote)}</span>
							</div>
						)}
					</TableCell>

					<TableCell className={cellClass}>
						{summary.isClosed ? '-' : money(summary.costBasis)}
					</TableCell>

					<TableCell className="py-2 text-gray-700 dark:text-white">
						<div className="flex flex-col">
							{!summary.isClosed && (
								<span className={profitClass(summary.unrealizedProfit)}>
									{money(summary.unrealizedProfit)}{' '}
									<span className="text-sm">
										({percentageFormat(summary.unrealizedPercentage)})
									</span>
								</span>
							)}
							{summary.hasSold && (
								<span className={classNames('text-sm', profitClass(summary.realizedProfit))}>
									Realized {money(summary.realizedProfit)}
								</span>
							)}
						</div>
					</TableCell>
					<TableCell className="py-2 pr-2 text-right">
						<Button
							className="ml-auto inline-flex"
							color="primary"
							size="sm"
							as={Link}
							to={fetchedCurrency.slug}
						>
							<FaPen color="white" />
						</Button>
					</TableCell>
				</>
			)}
		</TableRow>
	);
}

export default DashboardTableRow;
