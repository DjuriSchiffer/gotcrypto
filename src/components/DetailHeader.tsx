import React from 'react';
import { Button, Card, Dropdown } from 'flowbite-react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { getImage } from '../utils/images';
import { averagePurchasePrice, currencyFormat, currentValue, percentageDifference, percentageFormat } from '../utils/helpers';
import { SelectedAsset } from '../types/currency';
import { CurrencyQuote } from 'api';
import classNames from 'classnames';

interface DetailHeaderProps {
    currentFetchedCurrency: {
        name: string;
        cmc_id: number;
        price: number;
    };
    selectedAsset?: SelectedAsset;
    currencyQuote: keyof CurrencyQuote;
    onAddTransaction: () => void;
    onRemoveAllTransactions: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
    currentFetchedCurrency,
    selectedAsset,
    currencyQuote,
    onAddTransaction,
    onRemoveAllTransactions,
}) => {
    const totalsItem = selectedAsset?.totals;

    const totalAmount = totalsItem?.totalAmount ?? 0;
    const totalValue = totalAmount * currentFetchedCurrency.price;
    const totalInvested = totalsItem && totalsItem?.totalInvested ? parseFloat(
        totalsItem.totalInvested.toString()
    ) : 0;

    const totalAveragePurchasePrice = totalsItem ? parseFloat(
        totalsItem.totalAveragePurchasePrice.toString()
    ) : 0;
    const totalPercentageDifference = percentageDifference(
        totalInvested,
        totalValue
    );


    return (<>
        <div className="flex items-center justify-between mb-4 flex-wrap">
            <div className="flex items-center">
                <img
                    className="inline-block mr-4"
                    width={48}
                    height={48}
                    src={getImage(currentFetchedCurrency.cmc_id, 64)}
                    alt={`${currentFetchedCurrency.name} icon`}
                />
                <div className=' pr-1 mb-1'>
                    <h2 className="text-3xl font-bold text-white">
                        {currentFetchedCurrency.name}
                    </h2>
                    <p className="text-lg text-gray-400">
                        {currencyFormat(currentFetchedCurrency.price, currencyQuote)} per unit
                    </p>
                </div>
            </div>
            <div className="flex space-x-2">
                <Button onClick={onAddTransaction}>
                    <FaPlus color="white" className="mr-1" />
                    Add Transaction
                </Button>
                {selectedAsset && selectedAsset.transactions.length > 0 && (
                    <Dropdown label="..." color="gray" size="md" placement="bottom">
                        <Dropdown.Item icon={FaTrashAlt} onClick={onRemoveAllTransactions}>Remove All Transactions</Dropdown.Item>
                    </Dropdown>
                )}
            </div>
        </div>
        {selectedAsset?.totals && (
            <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
                <Card>
                    <div className="flex-root h-full">
                        <div className="flex items-center mb-1">
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
                        <div className="flex items-center mb-1">
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
                        <div className="flex items-center mb-1">
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
                        <div className="flex items-center mb-1">
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
    </>)


};

export default DetailHeader;