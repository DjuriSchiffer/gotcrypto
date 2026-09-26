import type { CurrencyQuote } from 'api';

import { Card } from 'flowbite-react';
import { Link } from 'react-router-dom';

import type { AssetBreakdown, Highlights } from '../../utils/portfolio';

import { currencyFormat, profitClass } from '../../utils/helpers';
import { getImage } from '../../utils/images';
import ProfitBadge from './ProfitBadge';

type HighlightProps = {
	currencyQuote: keyof CurrencyQuote;
	label: string;
	row: AssetBreakdown;
	variant: 'allocation' | 'profit';
};

function Highlight({ currencyQuote, label, row, variant }: HighlightProps) {
	return (
		<li className="py-3 first:pt-0 last:pb-0">
			<p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
				{label}
			</p>
			<div className="flex items-center gap-3">
				<img
					alt=""
					className="h-8 w-8 rounded-full"
					height={32}
					src={getImage(row.cmcId)}
					width={32}
				/>
				<div className="min-w-0 flex-1">
					<Link
						className="block truncate font-semibold text-gray-900 hover:underline dark:text-white"
						to={`/${row.slug}`}
					>
						{row.name}
					</Link>
					{variant === 'profit' ? (
						<span className={profitClass(row.totalProfit)}>
							{currencyFormat(row.totalProfit, currencyQuote)}
						</span>
					) : (
						<span className="text-gray-500 dark:text-gray-400">
							{currencyFormat(row.value, currencyQuote)}
						</span>
					)}
				</div>
				{variant === 'profit' ? (
					<ProfitBadge percentage={row.totalProfitPercentage} />
				) : (
					<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
						{row.allocation.toFixed(1)}%
					</span>
				)}
			</div>
		</li>
	);
}

type HighlightsCardProps = {
	currencyQuote: keyof CurrencyQuote;
	highlights: Highlights;
};

function HighlightsCard({ currencyQuote, highlights }: HighlightsCardProps) {
	const { best, largest, worst } = highlights;

	return (
		<Card className="h-full">
			<div className="flex flex-col gap-4">
				<div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Highlights</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Ranked by total profit, realized and unrealized
					</p>
				</div>
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					{best && (
						<Highlight
							currencyQuote={currencyQuote}
							label="Best performer"
							row={best}
							variant="profit"
						/>
					)}
					{worst && (
						<Highlight
							currencyQuote={currencyQuote}
							label="Worst performer"
							row={worst}
							variant="profit"
						/>
					)}
					{largest && (
						<Highlight
							currencyQuote={currencyQuote}
							label="Largest position"
							row={largest}
							variant="allocation"
						/>
					)}
				</ul>
			</div>
		</Card>
	);
}

export default HighlightsCard;
