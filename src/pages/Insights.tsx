import { Button, Card } from 'flowbite-react';
import { useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import AllocationCard from '../components/insights/AllocationCard';
import HighlightsCard from '../components/insights/HighlightsCard';
import PerformanceTable from '../components/insights/PerformanceTable';
import YearEndValuesCard from '../components/insights/YearEndValuesCard';
import Page from '../components/layout/Page';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import PortfolioStats from '../components/PortfolioStats';
import StalePricesNote from '../components/ui/StalePricesNote';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { getPortfolioDayChange } from '../utils/dayChange';
import { getHighlights, getPortfolioBreakdown } from '../utils/portfolio';
import { getGlobalTotals, getUnpricedHoldings } from '../utils/totals';

function Insights() {
	const { currencyQuote } = useAppState();
	const { selectedCurrencies } = useStorage();
	const {
		data: fetchedCurrencies,
		isError,
		isLoading,
		stale,
		updatedAt,
	} = useCoinMarketCap(currencyQuote);

	const totals = useMemo(
		() => getGlobalTotals(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);
	const rows = useMemo(
		() => getPortfolioBreakdown(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);
	const highlights = useMemo(() => getHighlights(rows), [rows]);
	const unpricedNames = useMemo(
		() => getUnpricedHoldings(selectedCurrencies, fetchedCurrencies).map((asset) => asset.name),
		[selectedCurrencies, fetchedCurrencies]
	);
	const dayChange = useMemo(
		() => getPortfolioDayChange(selectedCurrencies, fetchedCurrencies),
		[selectedCurrencies, fetchedCurrencies]
	);
	const openPositions = rows.filter((row) => !row.isClosed).length;

	return (
		<LoadingErrorWrapper fetchedIsLoading={isLoading} isError={isError}>
			<Page>
				<div className="mb-8 flex w-full flex-col gap-6">
					<header>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
						<p className="mt-1 text-gray-500 dark:text-gray-400">
							How your portfolio is doing, and where the value sits.
						</p>
					</header>

					<StalePricesNote stale={stale} updatedAt={updatedAt} />

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
							<PortfolioStats
								currencyQuote={currencyQuote}
								dayChange={dayChange}
								openPositions={openPositions}
								totals={totals}
								unpricedNames={unpricedNames}
							/>

							{/* Where the value sits, and what stands out */}
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
