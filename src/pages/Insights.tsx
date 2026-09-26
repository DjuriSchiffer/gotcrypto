import { Button, Card } from 'flowbite-react';
import { useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import AllocationCard from '../components/insights/AllocationCard';
import HighlightsCard from '../components/insights/HighlightsCard';
import PerformanceTable from '../components/insights/PerformanceTable';
import ProfitBadge from '../components/insights/ProfitBadge';
import StatCard from '../components/insights/StatCard';
import YearEndValuesCard from '../components/insights/YearEndValuesCard';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat, profitClass } from '../utils/helpers';
import { getHighlights, getPortfolioBreakdown } from '../utils/portfolio';
import { getGlobalTotals } from '../utils/totals';

function Insights() {
	const { currencyQuote } = useAppState();
	const { selectedCurrencies } = useStorage();
	const { data: fetchedCurrencies, isError, isLoading } = useCoinMarketCap(currencyQuote);

	const totals = useMemo(
		() => getGlobalTotals(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);
	const rows = useMemo(
		() => getPortfolioBreakdown(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);
	const highlights = useMemo(() => getHighlights(rows), [rows]);

	const money = (value: number) => currencyFormat(value, currencyQuote);
	const openPositions = rows.filter((row) => !row.isClosed).length;

	return (
		<LoadingErrorWrapper fetchedIsLoading={isLoading} isError={isError}>
			<Page>
				<div className="mb-8 flex w-full flex-col gap-6">
					<header>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio overview</h1>
						<p className="mt-1 text-gray-500 dark:text-gray-400">
							How your portfolio is doing, and where the value sits.
						</p>
					</header>

					{rows.length === 0 ? (
						<Card>
							<div className="flex flex-col items-center gap-4 py-10 text-center">
								<p className="text-gray-700 dark:text-gray-300">
									Add your first transaction to see your portfolio stats.
								</p>
								<Button as={Link} color="primary" to="/">
									<FaArrowLeft className="mr-2" />
									Go to dashboard
								</Button>
							</div>
						</Card>
					) : (
						<>
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

							<section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
								<div className="xl:col-span-2">
									<AllocationCard
										currencyQuote={currencyQuote}
										rows={rows}
										totalValue={totals.totalValue}
									/>
								</div>
								<HighlightsCard currencyQuote={currencyQuote} highlights={highlights} />
							</section>

							<PerformanceTable currencyQuote={currencyQuote} rows={rows} />

							<YearEndValuesCard
								currencyQuote={currencyQuote}
								fetchedCurrencies={fetchedCurrencies}
								selectedAssets={selectedCurrencies}
							/>
						</>
					)}
				</div>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Insights;
