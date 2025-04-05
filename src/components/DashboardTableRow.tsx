import { FetchedCurrency, SelectedAsset } from 'currency';
import { Card, Button, Table } from 'flowbite-react';
import {
  currencyFormat,
  percentageFormat,
} from '../utils/helpers';
import { getImage } from '../utils/images';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { CurrencyQuote } from 'api';
import { FaPen } from 'react-icons/fa';
import { getTotalAmount, getTotalInvested, getTotalPercentageDifference, getTotalPurchasePrice } from '../utils/totals';

type DashboardTableRow = {
  fetchedCurrency: FetchedCurrency;
  assetMap: Map<number, SelectedAsset>;
  isSelected: boolean;
  currencyQuote: keyof CurrencyQuote
};

const DashboardTableRow: React.FC<DashboardTableRow> = ({
  fetchedCurrency,
  assetMap,
  isSelected,
  currencyQuote
}) => {
  const percentageDifference = getTotalPercentageDifference(
    assetMap,
    fetchedCurrency.cmc_id,
    fetchedCurrency.price
  );
  const totalAmount = getTotalAmount(assetMap, fetchedCurrency.cmc_id);

  return (
    <Table.Row
      className={classNames('transition ease-in-out !border-gray-400', {
        'opacity-50': !isSelected,
        'hover:opacity-100': !isSelected
      })}
    >
      <Table.Cell className="whitespace-nowrap dark:text-white">
        <div className="flex items-center">
          <img
            width={32}
            height={32}
            src={getImage(fetchedCurrency.cmc_id)}
            alt={`${fetchedCurrency.name} icon`}
          />
          <div className="pl-2">{fetchedCurrency.name}</div>
        </div>
      </Table.Cell>
      <Table.Cell className="py-2 text-gray-900 dark:text-white">
        <div>
          {currencyFormat(fetchedCurrency.price, currencyQuote)}
        </div>
      </Table.Cell>
      {!isSelected && (<><Table.Cell className='dark:text-white'>No transactions added yet.</Table.Cell><Table.Cell /><Table.Cell /> </>)}
      {isSelected &&
        <>
          <Table.Cell className="py-2 text-gray-900 dark:text-white">
            <div className="flex flex-col">
              <div>{currencyFormat(totalAmount * fetchedCurrency.price, currencyQuote)}</div>
              <div className="text-sm">{totalAmount}</div>
            </div>
          </Table.Cell>
          <Table.Cell className="py-2 text-gray-900 dark:text-white">
            <div className="flex flex-col">
              <div>  {currencyFormat(
                getTotalInvested(assetMap, fetchedCurrency.cmc_id), currencyQuote
              )}</div>
            </div>
          </Table.Cell>
          <Table.Cell className="py-2 text-gray-900 dark:text-white">
            <div
              className={classNames(
                'inline-flex items-center text-gray-900',
                {
                  'text-blue-500': percentageDifference > 0,
                  'text-red-500': percentageDifference < 0,
                  'dark:text-white': percentageDifference === 0,
                }
              )}
            >
              {percentageFormat(percentageDifference)}
            </div>
          </Table.Cell>
        </>
      }


      <Table.Cell className="py-2 pr-2 text-right flex items-center justify-end">
        <Link to={fetchedCurrency.slug} className="ml-auto">
          <Button>
            <FaPen color="white" />
          </Button>
        </Link>
      </Table.Cell>
    </Table.Row>
  );
};

export default DashboardTableRow;
