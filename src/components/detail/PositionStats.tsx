import type { CurrencyQuote } from 'api';

import type { AssetSummary } from '../../utils/totals';

import { amountFormat, currencyFormat, profitClass } from '../../utils/helpers';
import ProfitBadge from '../ui/ProfitBadge';
import StatCard from '../ui/StatCard';

type PositionStatsProps = {
	currencyQuote: keyof CurrencyQuote;
	summary: AssetSummary;
};

function PositionStats({ currencyQuote, summary }: PositionStatsProps) {
	const money = (value: number) => currencyFormat(value, currencyQuote);

	return (
		<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard label="Holdings" value={money(summary.value)}>
				{amountFormat(summary.amount, currencyQuote)} coins
			</StatCard>
			<StatCard
				hint="What the coins you currently hold cost you. Selling lowers it by the average cost of the coins sold."
				label="Cost basis"
				value={money(summary.costBasis)}
			>
				Avg. cost {money(summary.averageCost)}
			</StatCard>
			<StatCard
				hint="Profit or loss on what you still hold: current value minus cost basis."
				label="Unrealized profit"
				value={money(summary.unrealizedProfit)}
				valueClassName={profitClass(summary.unrealizedProfit)}
			>
				<ProfitBadge percentage={summary.unrealizedPercentage} />
				on cost basis
			</StatCard>
			<StatCard
				hint="Profit or loss locked in by selling: sale proceeds minus the average cost of the coins sold."
				label="Realized profit"
				value={summary.hasSold ? money(summary.realizedProfit) : '–'}
				valueClassName={profitClass(summary.realizedProfit)}
			>
				{summary.hasSold ? 'From sells' : 'Nothing sold yet'}
			</StatCard>
		</section>
	);
}

export default PositionStats;
