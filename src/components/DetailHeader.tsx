import type { CurrencyQuote } from 'api';

import classNames from 'classnames';
import { Button, Card, Dropdown, DropdownItem } from 'flowbite-react';
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

function DetailHeader({
	currencyQuote,
	currentFetchedCurrency,
	onAddTransaction,
	onRemoveAllTransactions,
	selectedAsset,
}: DetailHeaderProps) {
	const totalsItem = selectedAsset?.totals;

	const totalAmount = totalsItem?.totalAmount ?? 0;
	const totalValue = totalAmount * currentFetchedCurrency.price;
	const totalInvested = totalsItem?.totalInvested
		? parseFloat(totalsItem.totalInvested.toString())
		: 0;

	const totalAveragePurchasePrice = totalsItem
		? parseFloat(totalsItem.totalAveragePurchasePrice.toString())
		: 0;
	const totalPercentageDifference = percentageDifference(totalInvested, totalValue);

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between">
				<div className="flex items-center">
					<img
						alt={`${currentFetchedCurrency.name} icon`}
						className="mr-4 inline-block"
						height={48}
						src={getImage(currentFetchedCurrency.cmc_id, 64)}
						width={48}
					/>
					<div className="mb-1 pr-1">
						<h2 className="text-3xl font-bold text-white">{currentFetchedCurrency.name}</h2>
						<p className="text-lg text-gray-400">
							{currencyFormat(currentFetchedCurrency.price, currencyQuote)} per unit
						</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<Button onClick={onAddTransaction}>
						<FaPlus className="mr-1" color="white" />
						Add Transaction
					</Button>
					{selectedAsset && selectedAsset.transactions.length > 0 && (
						<Dropdown color="gray" label="..." placement="bottom" size="md">
							<DropdownItem icon={FaTrashAlt} onClick={onRemoveAllTransactions}>
								Remove All Transactions
							</DropdownItem>
						</Dropdown>
					)}
				</div>
			</div>
			{selectedAsset?.totals && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
					<Card>
						<div className="flex-root h-full">
							<div className="mb-1 flex items-center">
								<h5 className="text-xs font-bold text-gray-900 dark:text-gray-500">
									Total Holdings
								</h5>
							</div>
							<div>
								<h5 className="text-md font-bold text-gray-900 dark:text-white">
									{selectedAsset.totals.totalAmount} {selectedAsset.name}
								</h5>
							</div>
							<div>
								<h5 className="text-md font-bold text-gray-900 dark:text-white">
									{currencyFormat(totalValue, currencyQuote)}
								</h5>
							</div>
						</div>
					</Card>
					<Card>
						<div className="flex-root h-full">
							<div className="mb-1 flex items-center">
								<h5 className="text-xs font-bold text-gray-900 dark:text-gray-500">
									Total invested
								</h5>
							</div>
							<div>
								<h5 className="text-md font-bold text-gray-900 dark:text-white">
									{currencyFormat(selectedAsset.totals.totalInvested, currencyQuote)}
								</h5>
							</div>
						</div>
					</Card>
					<Card>
						<div className="flex-root h-full">
							<div className="mb-1 flex items-center">
								<h5 className="text-xs font-bold text-gray-900 dark:text-gray-500">
									Total profit / loss
								</h5>
							</div>
							<div>
								<h5 className="text-md font-bold text-gray-900 dark:text-white">
									<div
										className={classNames('flex', {
											'text-blue-500': totalPercentageDifference > 0,
											'text-red-500': totalPercentageDifference < 0,
										})}
									>
										{percentageFormat(totalPercentageDifference)}
									</div>
								</h5>
							</div>
						</div>
					</Card>
					<Card>
						<div className="flex-root h-full">
							<div className="mb-1 flex items-center">
								<h5 className="text-xs font-bold text-gray-900 dark:text-gray-500">
									Avg. buy price
								</h5>
							</div>
							<div>
								<h5 className="text-md font-bold text-gray-900 dark:text-white">
									{currencyFormat(totalAveragePurchasePrice, currencyQuote)}
								</h5>
							</div>
						</div>
					</Card>
				</div>
			)}
		</>
	);
}

export default DetailHeader;
