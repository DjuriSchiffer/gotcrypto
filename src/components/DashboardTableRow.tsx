import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, TableCell, TableRow } from 'flowbite-react';
import { FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { currencyFormat, percentageFormat } from '../utils/helpers';
import { getImage } from '../utils/images';
import { getTotalAmount, getTotalInvested, getTotalPercentageDifference } from '../utils/totals';

type DashboardTableRow = {
	assetMap: Map<number, SelectedAsset>;
	currencyQuote: keyof CurrencyQuote;
	fetchedCurrency: FetchedCurrency;
	isSelected: boolean;
};

function DashboardTableRow({
	assetMap,
	currencyQuote,
	fetchedCurrency,
	isSelected,
}: DashboardTableRow) {
	const percentageDifference = getTotalPercentageDifference(
		assetMap,
		fetchedCurrency.cmc_id,
		fetchedCurrency.price
	);
	const totalAmount = getTotalAmount(assetMap, fetchedCurrency.cmc_id);

	return (
		<TableRow
			className={classNames('transition ease-in-out dark:!border-gray-400', {
				'hover:opacity-100': !isSelected,
				'opacity-50': !isSelected,
			})}
		>
			<TableCell className="whitespace-nowrap text-gray-700 dark:text-white">
				<div className="flex items-center">
					<img
						alt={`${fetchedCurrency.name} icon`}
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
					<div className="pl-2">{fetchedCurrency.name}</div>
				</div>
			</TableCell>
			<TableCell className="py-2 text-gray-700 dark:text-white">
				<div>{currencyFormat(fetchedCurrency.price, currencyQuote)}</div>
			</TableCell>
			{!isSelected && (
				<>
					<TableCell className="text-gray-700 dark:text-white">
						No transactions added yet.
					</TableCell>
					<TableCell />
					<TableCell />
				</>
			)}
			{isSelected && (
				<>
					<TableCell className="py-2 text-gray-700 dark:text-white">
						<div className="flex flex-col">
							<div>{currencyFormat(totalAmount * fetchedCurrency.price, currencyQuote)}</div>
							<div className="text-sm">{totalAmount}</div>
						</div>
					</TableCell>
					<TableCell className="py-2 text-gray-700 dark:text-white">
						<div className="flex flex-col">
							<div>
								{currencyFormat(getTotalInvested(assetMap, fetchedCurrency.cmc_id), currencyQuote)}
							</div>
						</div>
					</TableCell>
					<TableCell className="py-2">
						<div
							className={classNames('inline-flex items-center', {
								'dark:text-white': percentageDifference === 0,
								'text-green-500': percentageDifference > 0,
								'text-red-500': percentageDifference < 0,
							})}
						>
							{percentageFormat(percentageDifference)}
						</div>
					</TableCell>
				</>
			)}

			<TableCell className="flex items-center justify-end pr-2 text-right">
				<Link className="my-auto" to={fetchedCurrency.slug}>
					<Button color="primary" size="sm">
						<FaPen color="white" />
					</Button>
				</Link>
			</TableCell>
		</TableRow>
	);
}

export default DashboardTableRow;
