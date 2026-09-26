import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';
import type { ReactNode } from 'react';

import classNames from 'classnames';
import { Button, Card } from 'flowbite-react';
import { FaPen, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { amountFormat, currencyFormat, percentageFormat, profitClass } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getAssetSummary } from '../utils/totals';

type DashboardCardProps = {
	asset?: SelectedAsset;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	onAddTransaction: () => void;
};

type StatRowProps = {
	children: ReactNode;
	description?: string;
	label: string;
};

function StatRow({ children, description, label }: StatRowProps) {
	return (
		<li className="py-3 sm:py-4">
			<div className="flex items-center space-x-4">
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-gray-700 dark:text-white">{label}</p>
					{description && (
						<p className="truncate text-sm text-gray-500 dark:text-gray-400">{description}</p>
					)}
				</div>
				<div className="flex flex-col items-end text-base font-semibold text-gray-700 dark:text-white">
					{children}
				</div>
			</div>
		</li>
	);
}

function DashboardCard({
	asset,
	currencyQuote,
	fetchedCurrency,
	onAddTransaction,
}: DashboardCardProps) {
	const hasTransactions = (asset?.transactions.length ?? 0) > 0;
	const summary = getAssetSummary(asset, fetchedCurrency.price);
	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
		<Card className={classNames('transition ease-in-out')}>
			<div className="flex items-center space-x-2">
				<div className="shrink-0">
					<img
						alt={`${fetchedCurrency.name} icon`}
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
				</div>

				<div className="flex min-w-0 flex-1 items-center">
					<h5 className="text-xl font-bold leading-none text-gray-700 dark:text-white">
						{fetchedCurrency.name}
					</h5>
					{hasTransactions && (
						<Button
							className="ml-auto"
							color="primary"
							size="sm"
							as={Link}
							to={fetchedCurrency.slug}
						>
							<FaPen color="white" />
						</Button>
					)}
				</div>
			</div>

			<div className={classNames('mb-auto', { 'h-full': !hasTransactions })}>
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					<StatRow label="Current market price">{money(fetchedCurrency.price)}</StatRow>

					{!hasTransactions && (
						<li className="pb-1 pt-6 text-center">
							<p className="mb-3 text-sm font-medium text-gray-700 dark:text-white">
								No transactions added yet.
							</p>
							<Button className="mx-auto" color="primary" onClick={onAddTransaction} size="sm">
								<FaPlus className="mr-1" />
								Add first transaction
							</Button>
						</li>
					)}

					{hasTransactions && summary.isClosed && (
						<StatRow description="Position closed" label="Holdings">
							{amountFormat(0, currencyQuote)}
						</StatRow>
					)}

					{hasTransactions && !summary.isClosed && (
						<>
							<StatRow description="Worth at current price" label="Holdings">
								<span>{amountFormat(summary.amount, currencyQuote)}</span>
								<span className="text-sm font-normal">{money(summary.value)}</span>
							</StatRow>
							<StatRow description={`Avg. cost ${money(summary.averageCost)}`} label="Cost basis">
								{money(summary.costBasis)}
							</StatRow>
							<StatRow description="On current holdings" label="Unrealized profit">
								<span className={profitClass(summary.unrealizedProfit)}>
									{money(summary.unrealizedProfit)}
								</span>
								<span
									className={classNames(
										'text-sm font-normal',
										profitClass(summary.unrealizedPercentage)
									)}
								>
									{percentageFormat(summary.unrealizedPercentage)}
								</span>
							</StatRow>
						</>
					)}

					{hasTransactions && summary.hasSold && (
						<StatRow description="Locked in by selling" label="Realized profit">
							<span className={profitClass(summary.realizedProfit)}>
								{money(summary.realizedProfit)}
							</span>
						</StatRow>
					)}
				</ul>
			</div>
		</Card>
	);
}

export default DashboardCard;
