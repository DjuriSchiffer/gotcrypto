import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import classNames from 'classnames';
import { Button, Table } from 'flowbite-react';
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
		<Table.Row
			className={classNames('!border-gray-400 transition ease-in-out', {
				'hover:opacity-100': !isSelected,
				'opacity-50': !isSelected,
			})}
		>
			<Table.Cell className="whitespace-nowrap dark:text-white">
				<div className="flex items-center">
					<img
						alt={`${fetchedCurrency.name} icon`}
						height={32}
						src={getImage(fetchedCurrency.cmc_id)}
						width={32}
					/>
					<div className="pl-2">{fetchedCurrency.name}</div>
				</div>
			</Table.Cell>
			<Table.Cell className="py-2 text-gray-900 dark:text-white">
				<div>{currencyFormat(fetchedCurrency.price, currencyQuote)}</div>
			</Table.Cell>
			{!isSelected && (
				<>
					<Table.Cell className="dark:text-white">No transactions added yet.</Table.Cell>
					<Table.Cell />
					<Table.Cell />{' '}
				</>
			)}
			{isSelected && (
				<>
					<Table.Cell className="py-2 text-gray-900 dark:text-white">
						<div className="flex flex-col">
							<div>{currencyFormat(totalAmount * fetchedCurrency.price, currencyQuote)}</div>
							<div className="text-sm">{totalAmount}</div>
						</div>
					</Table.Cell>
					<Table.Cell className="py-2 text-gray-900 dark:text-white">
						<div className="flex flex-col">
							<div>
								{' '}
								{currencyFormat(getTotalInvested(assetMap, fetchedCurrency.cmc_id), currencyQuote)}
							</div>
						</div>
					</Table.Cell>
					<Table.Cell className="py-2 text-gray-900 dark:text-white">
						<div
							className={classNames('inline-flex items-center text-gray-900', {
								'dark:text-white': percentageDifference === 0,
								'text-blue-500': percentageDifference > 0,
								'text-red-500': percentageDifference < 0,
							})}
						>
							{percentageFormat(percentageDifference)}
						</div>
					</Table.Cell>
				</>
			)}

			<Table.Cell className="flex items-center justify-end py-2 pr-2 text-right">
				<Link className="ml-auto" to={fetchedCurrency.slug}>
					<Button>
						<FaPen color="white" />
					</Button>
				</Link>
			</Table.Cell>
		</Table.Row>
	);
}

export default DashboardTableRow;
