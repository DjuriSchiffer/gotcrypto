import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import { Badge, Button, Card } from 'flowbite-react';
import { FaArrowRight, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { amountFormat, currencyFormat, profitClass } from '../../utils/helpers';
import { getImage } from '../../utils/images';
import { getAssetSummary } from '../../utils/totals';
import EmptyState from '../ui/EmptyState';
import ProfitBadge from '../ui/ProfitBadge';

type AssetCardProps = {
	asset: SelectedAsset | undefined;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	onAddTransaction: () => void;
};

function AssetCard({ asset, currencyQuote, fetchedCurrency, onAddTransaction }: AssetCardProps) {
	const hasTransactions = (asset?.transactions.length ?? 0) > 0;
	const summary = getAssetSummary(asset, fetchedCurrency.price);
	const money = (value: number) => currencyFormat(value, currencyQuote);
	const detailPath = `/${fetchedCurrency.slug}`;

	return (
		<Card className="h-full">
			<div className="flex h-full flex-col gap-4">
				<div className="flex items-center gap-3">
					<img
						alt=""
						className="h-10 w-10 rounded-full"
						height={40}
						src={getImage(fetchedCurrency.cmc_id)}
						width={40}
					/>
					<div className="min-w-0 flex-1">
						<Link
							className="block truncate text-lg font-semibold text-gray-900 hover:underline dark:text-white"
							to={detailPath}
						>
							{fetchedCurrency.name}
						</Link>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{money(fetchedCurrency.price)}
						</p>
					</div>
					<Button
						aria-label={`Open ${fetchedCurrency.name}`}
						as={Link}
						color="gray"
						size="sm"
						to={detailPath}
					>
						<FaArrowRight />
					</Button>
				</div>

				{!hasTransactions && (
					<EmptyState
						action={
							<Button color="indigo" onClick={onAddTransaction} size="sm">
								<FaPlus className="mr-2" />
								Add first transaction
							</Button>
						}
						compact
						message="No transactions yet."
					/>
				)}

				{hasTransactions && summary.isClosed && (
					<div className="flex flex-col gap-2">
						<Badge className="w-fit" color="gray">
							Position closed
						</Badge>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Realized{' '}
							<span className={profitClass(summary.realizedProfit)}>
								{money(summary.realizedProfit)}
							</span>
						</p>
					</div>
				)}

				{hasTransactions && !summary.isClosed && (
					<>
						<div>
							<p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
								{money(summary.value)}
							</p>
							<div className="mt-1 flex items-start justify-between gap-2">
								<span className="text-sm text-gray-500 dark:text-gray-400">
									{amountFormat(summary.amount, currencyQuote)} coins
								</span>
								<span className="flex flex-col items-end gap-2 text-sm">
									<span className={profitClass(summary.unrealizedProfit)}>
										{money(summary.unrealizedProfit)}
									</span>
									<ProfitBadge percentage={summary.unrealizedPercentage} />
								</span>
							</div>
						</div>

						<dl className="mt-auto flex justify-between gap-4 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
							<div>
								<dt className="text-gray-500 dark:text-gray-400">Cost basis</dt>
								<dd className="font-medium text-gray-900 dark:text-white">
									{money(summary.costBasis)}
								</dd>
							</div>
							<div className="flex flex-col items-end">
								<dt className="text-gray-500 dark:text-gray-400">Realized</dt>
								<dd
									className={
										summary.hasSold ? profitClass(summary.realizedProfit) : 'text-gray-400'
									}
								>
									{summary.hasSold ? money(summary.realizedProfit) : '–'}
								</dd>
							</div>
						</dl>
					</>
				)}
			</div>
		</Card>
	);
}

export default AssetCard;
