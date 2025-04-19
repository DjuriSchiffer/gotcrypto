import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, Card } from 'flowbite-react';
import { FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { currencyFormat, percentageFormat } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getTotalAmount, getTotalInvested, getTotalPercentageDifference } from '../utils/totals';

type DashboardCard = {
	assetMap: Map<number, SelectedAsset>;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	isSelected: boolean;
};

function DashboardCard({ assetMap, currencyQuote, fetchedCurrency, isSelected }: DashboardCard) {
	const percentageDifference = getTotalPercentageDifference(
		assetMap,
		fetchedCurrency.cmc_id,
		fetchedCurrency.price
	);
	const totalAmount = getTotalAmount(assetMap, fetchedCurrency.cmc_id);

	return (
		<Card
			className={classNames('transition ease-in-out', {
				'hover:opacity-100': !isSelected,
				'opacity-50': !isSelected,
			})}
		>
			<div className="flex space-x-2">
				<div className="shrink-0">
					<img
						alt={`${fetchedCurrency.name} icon`}
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
				</div>
				<div className="flex min-w-0 flex-1 items-center">
					<h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
						{fetchedCurrency.name}
					</h5>
					<Link className="ml-auto" to={fetchedCurrency.slug}>
						<Button color="primary">
							<FaPen color="white" />
						</Button>
					</Link>
				</div>
			</div>
			<div
				className={classNames('flex-root', {
					'h-full': !isSelected,
				})}
			>
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					<li className="py-3 sm:py-4">
						<div className="flex items-center space-x-4">
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
									Current market price
								</p>
								<p className="truncate text-sm text-gray-500 dark:text-gray-400">
									{currencyFormat(fetchedCurrency.price, currencyQuote)}
								</p>
							</div>
						</div>
					</li>
					{!isSelected && (
						<li className="pt-6 pb-1">
							<div className="flex items-center space-x-4">
								<div className="min-w-0 flex-1">
									<p className="truncate text-center text-sm font-medium text-gray-900 dark:text-white">
										No transactions added yet.
									</p>
								</div>
							</div>
						</li>
					)}
					{isSelected && (
						<>
							<li className="py-3 sm:py-4">
								<div className="flex items-center space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
											Total holdings
										</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											Total amount bougth minus total sold
										</p>
									</div>
									<div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
										{totalAmount}
									</div>
								</div>
							</li>
							<li className="py-3 sm:py-4">
								<div className="flex items-center space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
											Total value
										</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											Total amount bougth times current market price
										</p>
									</div>
									<div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
										{currencyFormat(totalAmount * fetchedCurrency.price, currencyQuote)}
									</div>
								</div>
							</li>
							<li className="py-3 sm:py-4">
								<div className="flex items-center space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
											Total invested
										</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											Total spend minus total sold
										</p>
									</div>
									<div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
										{currencyFormat(
											getTotalInvested(assetMap, fetchedCurrency.cmc_id),
											currencyQuote
										)}
									</div>
								</div>
							</li>
							<li className="pb-0 pt-3 sm:pt-4">
								<div className="flex items-center space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
											Total profit
										</p>
										<p className="truncate text-sm text-gray-500 dark:text-gray-400">
											In percentages
										</p>
									</div>
									<div
										className={classNames(
											'inline-flex items-center text-base font-semibold text-gray-900',
											{
												'dark:text-white': percentageDifference === 0,
												'text-blue-500': percentageDifference > 0,
												'text-red-500': percentageDifference < 0,
											}
										)}
									>
										{percentageFormat(percentageDifference)}
									</div>
								</div>
							</li>
						</>
					)}
				</ul>
			</div>
		</Card>
	);
}

export default DashboardCard;
