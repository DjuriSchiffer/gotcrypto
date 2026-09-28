import type { CurrencyQuote } from 'api';
import type { GlobalTotals } from 'store';

import { currencyFormat, profitClass } from '../utils/helpers';
import ProfitBadge from './ui/ProfitBadge';
import StatCard from './ui/StatCard';

type PortfolioStatsProps = {
	currencyQuote: keyof CurrencyQuote;
	openPositions: number;
	totals: GlobalTotals;
};

/** The four key portfolio figures, shared by the Dashboard and Insights pages. */
function PortfolioStats({ currencyQuote, openPositions, totals }: PortfolioStatsProps) {
	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
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
	);
}

export default PortfolioStats;
