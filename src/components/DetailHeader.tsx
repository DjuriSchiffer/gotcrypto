import type { CurrencyQuote } from 'api';
import type { ReactNode } from 'react';

import classNames from 'classnames';
import { Button, Card, Dropdown, DropdownItem, useThemeMode } from 'flowbite-react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

import type { SelectedAsset } from '../types/currency';

import { currencyFormat, percentageDifference, percentageFormat } from '../utils/helpers';
import { getImage } from '../utils/images';

type DetailHeaderProps = {
	currencyQuote: keyof CurrencyQuote;
	currentFetchedCurrency: {
		cmc_id: number;
		name: string;
		price: number;
	};
	onAddTransaction: () => void;
	onRemoveAllTransactions: () => void;
	selectedAsset?: SelectedAsset;
};

const profitClass = (value: number) =>
	classNames({ 'text-green-500': value > 0, 'text-red-500': value < 0 });

function StatCard({ children, title }: { children: ReactNode; title: string }) {
	return (
		<Card>
			<div className="flex-root h-full">
				<h5 className="mb-1 text-xs font-bold text-gray-900 dark:text-gray-500">{title}</h5>
				<div className="text-md font-bold text-gray-900 dark:text-white">{children}</div>
			</div>
		</Card>
	);
}

function DetailHeader({
	currencyQuote,
	currentFetchedCurrency,
	onAddTransaction,
	onRemoveAllTransactions,
	selectedAsset,
}: DetailHeaderProps) {
	const { computedMode } = useThemeMode();
	const isDarkMode = computedMode === 'dark';
	const totals = selectedAsset?.totals;

	const totalAmount = totals?.totalAmount ?? 0;
	const totalValue = totalAmount * currentFetchedCurrency.price;
	const costBasis = totals?.totalCostBasis ?? 0;
	const averageCost = totals?.totalAverageCost ?? 0;
	const realizedProfit = totals?.totalRealizedProfit ?? 0;
	const unrealizedProfit = totalValue - costBasis;
	const unrealizedPercentage = percentageDifference(costBasis, totalValue);

	return (
		<>
			<div className="mb-4 flex flex-col flex-wrap lg:flex-row lg:items-center lg:justify-between">
				<div className="mb-4 flex items-center lg:mb-0">
					<img
						alt={`${currentFetchedCurrency.name} icon`}
						className="mr-4 inline-block"
						height={48}
						src={getImage(currentFetchedCurrency.cmc_id, 64)}
						width={48}
					/>
					<div className="mb-1 pr-1">
						<h2 className="text-3xl font-bold text-dark dark:text-white">
							{currentFetchedCurrency.name}
						</h2>
						<p className="text-lg text-gray-400">
							Current market price <br />{' '}
							{currencyFormat(currentFetchedCurrency.price, currencyQuote)}
						</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<Button color="primary" onClick={onAddTransaction}>
						<FaPlus className="mr-1" color="white" />
						Add Transaction
					</Button>
					{selectedAsset && selectedAsset.transactions.length > 0 && (
						<Dropdown
							color={isDarkMode ? 'gray' : 'light'}
							label="..."
							placement="bottom"
							size="md"
						>
							<DropdownItem icon={FaTrashAlt} onClick={onRemoveAllTransactions}>
								Remove All Transactions
							</DropdownItem>
						</Dropdown>
					)}
				</div>
			</div>
			{selectedAsset && totals && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard title="Total holdings">
						<div>
							{totalAmount} {selectedAsset.name}
						</div>
						<div>{currencyFormat(totalValue, currencyQuote)}</div>
					</StatCard>

					<StatCard title="Cost basis">
						<div>{currencyFormat(costBasis, currencyQuote)}</div>
						<div className="text-xs font-normal text-gray-500 dark:text-gray-400">
							Avg. cost {currencyFormat(averageCost, currencyQuote)}
						</div>
					</StatCard>

					<StatCard title="Unrealized profit / loss">
						<div className={profitClass(unrealizedProfit)}>
							{currencyFormat(unrealizedProfit, currencyQuote)}
						</div>
						<div className={profitClass(unrealizedPercentage)}>
							{percentageFormat(unrealizedPercentage)}
						</div>
					</StatCard>

					<StatCard title="Realized profit / loss">
						<div className={profitClass(realizedProfit)}>
							{currencyFormat(realizedProfit, currencyQuote)}
						</div>
					</StatCard>
				</div>
			)}
		</>
	);
}

export default DetailHeader;
