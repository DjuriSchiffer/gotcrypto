import { FetchedCurrency, SelectedCurrency } from 'currency';
import { Card, Button } from 'flowbite-react';
import {
  percentageDifference,
  currentValue,
  currencyFormat,
  percentageFormat,
} from '../utils/calculateHelpers';
import { getImage } from '../utils/images';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Icon from './Icon';

type DashboardCard = {
  fetchedCurrency: FetchedCurrency;
  cryptoMap: Map<number, SelectedCurrency>;
  isSelected: boolean;
};

export const getTotalAmount = (
  cryptoMap: Map<number, SelectedCurrency>,
  cmcId: number
): number => {
  return cryptoMap.get(cmcId)?.totals.totalAmount || 0;
};

export const getTotalPurchasePrice = (
  cryptoMap: Map<number, SelectedCurrency>,
  cmcId: number
): number => {
  return cryptoMap.get(cmcId)?.totals.totalPurchasePrice || 0;
};

export const getTotalPercentageDifference = (
  cryptoMap: Map<number, SelectedCurrency>,
  cmcId: number,
  currentMarketPrice: number
): number => {
  const currency = cryptoMap.get(cmcId);
  if (
    !currency ||
    !currency.totals.totalAmount ||
    !currency.totals.totalPurchasePrice
  ) {
    return 0;
  }

  const totalValue = currentValue(
    currency.totals.totalAmount,
    currentMarketPrice
  );
  return percentageDifference(currency.totals.totalPurchasePrice, totalValue);
};

const DashboardCard: React.FC<DashboardCard> = ({
  fetchedCurrency,
  cryptoMap,
  isSelected,
}) => {
  const percentageDifference = getTotalPercentageDifference(
    cryptoMap,
    fetchedCurrency.cmc_id,
    fetchedCurrency.price
  );

  return (
    <Card
      className={classNames('transition ease-in-out', {
        'opacity-50': !isSelected,
        'hover:opacity-100': !isSelected,
      })}
    >
      <div className="flex space-x-2">
        <div className="shrink-0">
          <img
            width={32}
            height={32}
            src={getImage(fetchedCurrency.cmc_id)}
            alt={`${fetchedCurrency.name} icon`}
          />
        </div>
        <div className="min-w-0 flex-1 flex items-center">
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            {fetchedCurrency.name}
          </h5>
          <Link to={fetchedCurrency.slug} className="ml-auto">
            <Button>
              <Icon id="Edit" color="white" />
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
                  {currencyFormat(fetchedCurrency.price)}
                </p>
              </div>
            </div>
          </li>
          {!isSelected && (
            <li className="pt-6 pb-1">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-center font-medium text-gray-900 dark:text-white">
                    No assets added yet.
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
                    {getTotalAmount(cryptoMap, fetchedCurrency.cmc_id)}
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
                      Total costs minus total sold
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    {currencyFormat(
                      getTotalPurchasePrice(cryptoMap, fetchedCurrency.cmc_id)
                    )}
                  </div>
                </div>
              </li>
              <li className="pb-0 pt-3 sm:pt-4">
                <div className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Total percentage difference
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      In percentages
                    </p>
                  </div>
                  <div
                    className={classNames(
                      'inline-flex items-center text-base font-semibold text-gray-900',
                      {
                        'text-blue-500': percentageDifference > 0,
                        'text-red-500': percentageDifference < 0,
                        'dark:text-white': percentageDifference === 0,
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
};

export default DashboardCard;
