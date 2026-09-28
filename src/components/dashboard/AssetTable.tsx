import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

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
} from 'flowbite-react';
import { FaArrowRight, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { amountFormat, currencyFormat, profitClass } from '../../utils/helpers';
import { getImage } from '../../utils/images';
import { getAssetSummary } from '../../utils/totals';
import ProfitBadge from '../ui/ProfitBadge';
import SectionCard from '../ui/SectionCard';

type AssetRowProps = {
	asset: SelectedAsset | undefined;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	onAddTransaction: () => void;
};

function AssetRow({ asset, currencyQuote, fetchedCurrency, onAddTransaction }: AssetRowProps) {
	const hasTransactions = (asset?.transactions.length ?? 0) > 0;
	const summary = getAssetSummary(asset, fetchedCurrency.price);
	const money = (value: number) => currencyFormat(value, currencyQuote);
	const detailPath = `/${fetchedCurrency.slug}`;

	return (
		<TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
			<TableCell className="whitespace-nowrap">
				<Link className="flex items-center gap-3" to={detailPath}>
					<img
						alt=""
						className="h-8 w-8 rounded-full"
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
					<span className="flex flex-col">
						<span className="font-medium text-gray-900 hover:underline dark:text-white">
							{fetchedCurrency.name}
						</span>
						<span className="text-xs text-gray-500 dark:text-gray-400">
							{money(fetchedCurrency.price)}
						</span>
					</span>
				</Link>
			</TableCell>

			{!hasTransactions && (
				<TableCell colSpan={3}>
					<Button color="primary" onClick={onAddTransaction} size="xs">
						<FaPlus className="mr-1" />
						Add first transaction
					</Button>
				</TableCell>
			)}

			{hasTransactions && (
				<>
					<TableCell className="text-right">
						{summary.isClosed ? (
							<Badge className="ml-auto w-fit" color="gray">
								Closed
							</Badge>
						) : (
							<div className="flex flex-col items-end">
								<span className="text-gray-900 dark:text-white">{money(summary.value)}</span>
								<span className="text-xs">{amountFormat(summary.amount, currencyQuote)} coins</span>
							</div>
						)}
					</TableCell>
					<TableCell className="text-right">
						{summary.isClosed ? '–' : money(summary.costBasis)}
					</TableCell>
					<TableCell className="text-right">
						<div className="flex flex-col items-end gap-1">
							{!summary.isClosed && (
								<span className="flex items-center gap-2">
									<span className={profitClass(summary.unrealizedProfit)}>
										{money(summary.unrealizedProfit)}
									</span>
									<ProfitBadge percentage={summary.unrealizedPercentage} />
								</span>
							)}
							{summary.hasSold && (
								<span className={classNames('text-xs', profitClass(summary.realizedProfit))}>
									Realized {money(summary.realizedProfit)}
								</span>
							)}
						</div>
					</TableCell>
				</>
			)}

			<TableCell className="text-right">
				<Button
					aria-label={`Open ${fetchedCurrency.name}`}
					as={Link}
					className="ml-auto w-fit"
					color="gray"
					size="xs"
					to={detailPath}
				>
					<FaArrowRight />
				</Button>
			</TableCell>
		</TableRow>
	);
}

type AssetTableProps = {
	assetMap: Map<number, SelectedAsset>;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrencies: Array<FetchedCurrency>;
	onAddTransaction: (currency: FetchedCurrency) => void;
};

function AssetTable({
	assetMap,
	currencyQuote,
	fetchedCurrencies,
	onAddTransaction,
}: AssetTableProps) {
	return (
		<SectionCard flush title="Assets">
			<div className="overflow-x-auto">
				<Table hoverable>
					<TableHead>
						<TableHeadCell>Asset</TableHeadCell>
						<TableHeadCell className="text-right">Value</TableHeadCell>
						<TableHeadCell className="text-right">Cost basis</TableHeadCell>
						<TableHeadCell className="text-right">Profit / loss</TableHeadCell>
						<TableHeadCell>
							<span className="sr-only">Open</span>
						</TableHeadCell>
					</TableHead>
					<TableBody className="divide-y">
						{fetchedCurrencies.map((currency) => (
							<AssetRow
								asset={assetMap.get(currency.cmc_id)}
								currencyQuote={currencyQuote}
								fetchedCurrency={currency}
								key={currency.cmc_id}
								onAddTransaction={() => onAddTransaction(currency)}
							/>
						))}
					</TableBody>
				</Table>
			</div>
		</SectionCard>
	);
}

export default AssetTable;
