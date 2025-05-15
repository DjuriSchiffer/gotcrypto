import type { FetchedCurrency } from 'currency';

import classNames from 'classnames';
import { Card, Tooltip } from 'flowbite-react';
import { useMemo } from 'react';

import Charts from '../components/Charts';
import { HistoricalPortfolioValues } from '../components/HistoricalPortfolioValues';
import LoadingErrorWrapper from '../components/LoadingErrorWrapper';
import Page from '../components/Page';
import { useAppState } from '../hooks/useAppState';
import useCoinMarketCap from '../hooks/useCoinMarketCap';
import { useStorage } from '../hooks/useStorage';
import { createCryptoMap, currencyFormat, percentageFormat } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getGlobalTotals, getTotalPercentageDifference } from '../utils/totals';

function Graphs() {
	const { currencyQuote } = useAppState();
	const {
		data: fetchedCurrencies,
		isError: fetchedCurrenciesIsError,
		isLoading: fetchedCurrenciesIsLoading,
	} = useCoinMarketCap(currencyQuote);
	const { loading: storageIsLoading, selectedCurrencies } = useStorage();

	const assetMap = useMemo(() => createCryptoMap(selectedCurrencies), [selectedCurrencies]);

	const globalTotals = useMemo(() => {
		return getGlobalTotals(selectedCurrencies, fetchedCurrencies);
	}, [fetchedCurrencies, selectedCurrencies]);

	const bestPerformingAsset = useMemo(() => {
		const assetsWithPerformance = selectedCurrencies.map((selectedCurrency) => {
			const currentCurrency = fetchedCurrencies?.find(
				(fetchedCurrency) => fetchedCurrency.cmc_id === selectedCurrency.cmc_id
			);
			const currentPrice = currentCurrency?.price ?? 0;
			const currentCMCID = currentCurrency?.cmc_id ?? 0;
			const percentageDifference = getTotalPercentageDifference(
				assetMap,
				currentCMCID,
				currentPrice
			);

			return {
				currentCurrency: currentCurrency,
				percentageDifference,
			};
		});

		return assetsWithPerformance.reduce<null | {
			currentCurrency: FetchedCurrency | undefined;
			percentageDifference: number;
		}>((best, current) => {
			if (!best || current.percentageDifference > best.percentageDifference) {
				return current;
			}
			return best;
		}, null);
	}, [selectedCurrencies, fetchedCurrencies, assetMap]);

	return (
		<LoadingErrorWrapper
			fetchedIsLoading={fetchedCurrenciesIsLoading}
			isError={fetchedCurrenciesIsError}
			storageIsLoading={storageIsLoading}
		>
			<Page>
				<div className="mb-4 grid w-full gap-4 lg:mt-auto">
					<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-dark dark:text-white">
							Total value
							<Tooltip content="Total Value">
								<div className="text-4xl">
									{currencyFormat(globalTotals.totalValue, currencyQuote)}
								</div>
							</Tooltip>
						</div>
						<div className="text-dark dark:text-white">
							Total invested
							<Tooltip content="Total Invested">
								<div className="text-4xl">
									{currencyFormat(globalTotals.totalInvested, currencyQuote)}
								</div>
							</Tooltip>
						</div>
						<div className="text-dark dark:text-white">
							Total Profit/loss
							<Tooltip content="((Total Value - Total Invested) / Total Invested) × 100">
								<div
									className={classNames('text-xl', {
										'text-green-500': globalTotals.totalPercentageDifference > 0,
										'text-red-500': globalTotals.totalPercentageDifference < 0,
									})}
								>
									<div className="text-4xl">
										{percentageFormat(globalTotals.totalPercentageDifference)}
									</div>
								</div>
							</Tooltip>
						</div>
						{bestPerformingAsset && (
							<div className="text-dark dark:text-white">
								Best performing asset
								<Tooltip content="Based by total profit per asset">
									<div className="text-4xl">
										<div className="flex items-center">
											<img
												alt={`${bestPerformingAsset.currentCurrency?.name || 'Asset'} icon`}
												height={32}
												src={getImage(bestPerformingAsset.currentCurrency?.cmc_id)}
												width={32}
											/>
											<div className="pl-2"> {bestPerformingAsset.currentCurrency?.name}</div>
										</div>
									</div>
								</Tooltip>
							</div>
						)}
					</div>
					{selectedCurrencies.length === 0 && (
						<Card>
							<div className="flex h-40 items-center justify-center text-dark dark:text-white">
								<span>No assets added yet.</span>
							</div>
						</Card>
					)}
					{selectedCurrencies.length > 0 && (
						<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2">
							<Card>
								<Charts
									assetMap={assetMap}
									fetchedCurrencies={fetchedCurrencies}
									id="amount"
									selectedAssets={selectedCurrencies}
								/>
							</Card>
							<Card>
								<Charts
									assetMap={assetMap}
									fetchedCurrencies={fetchedCurrencies}
									id="invested"
									selectedAssets={selectedCurrencies}
								/>
							</Card>
						</div>
					)}
					{selectedCurrencies.length > 0 && (
						<HistoricalPortfolioValues
							currencyQuote={currencyQuote}
							fetchedCurrencies={fetchedCurrencies}
							selectedAssets={selectedCurrencies}
						/>
					)}
				</div>
			</Page>
		</LoadingErrorWrapper>
	);
}

export default Graphs;
