import type { CurrencyQuote } from 'api';
import type { GlobalTotals } from 'store';

import { FaInfoCircle } from 'react-icons/fa';

import { currencyFormat, profitClass } from '../utils/helpers';
import ProfitBadge from './ui/ProfitBadge';
import StatCard from './ui/StatCard';

type PortfolioStatsProps = {
	currencyQuote: keyof CurrencyQuote;
	openPositions: number;
	totals: GlobalTotals;
	/** Names of held coins without a current price; they're left out of the totals */
	unpricedNames?: Array<string>;
};

const listNames = (names: Array<string>): string =>
	names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${String(names.at(-1))}`;

/** Explains which coins the totals leave out, and why. */
const unpricedNote = (names: Array<string>): string =>
	names.length === 1
		? `${names[0]} has no current price, so it isn't included in total value, cost basis and unrealized profit.`
		: `${listNames(names)} have no current price, so they aren't included in total value, cost basis and unrealized profit.`;

/** The four key portfolio figures, shared by the Dashboard and Insights pages. */
function PortfolioStats({
	currencyQuote,
	openPositions,
	totals,
	unpricedNames = [],
}: PortfolioStatsProps) {
	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
		<div className="flex flex-col gap-3">
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Total value" value={money(totals.totalValue)}>
					{openPositions} open {openPositions === 1 ? 'position' : 'positions'}
				</StatCard>
				<StatCard
					hint="What the coins you currently hold cost you. Selling lowers it by the average cost of the coins sold."
					label="Cost basis"
					value={money(totals.totalCostBasis)}
				/>
				<StatCard
					hint="Profit or loss on what you still hold: current value minus cost basis."
					label="Unrealized profit"
					value={money(totals.totalUnrealizedProfit)}
					valueClassName={profitClass(totals.totalUnrealizedProfit)}
				>
					<ProfitBadge percentage={totals.totalPercentageDifference} />
					on cost basis
				</StatCard>
				<StatCard
					hint="Profit or loss locked in by selling: sale proceeds minus the average cost of the coins sold."
					label="Realized profit"
					value={money(totals.totalRealizedProfit)}
					valueClassName={profitClass(totals.totalRealizedProfit)}
				/>
			</section>

			{unpricedNames.length > 0 && (
				<p
					className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
					role="status"
				>
					<FaInfoCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
					{unpricedNote(unpricedNames)}
				</p>
			)}
		</div>
	);
}

export default PortfolioStats;
