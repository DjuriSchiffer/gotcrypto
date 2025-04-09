import type { CurrencyQuote } from 'api';

import { useQueryClient } from '@tanstack/react-query';
import { Card, Label } from 'flowbite-react';
import { useMemo } from 'react';
import { FaDollarSign, FaEuroSign } from 'react-icons/fa';

import { useStorage } from '../hooks/useStorage';
import { currencyFormat } from '../utils/helpers';

type PriceOption = {
    example: string;
    label: string;
    quote: keyof CurrencyQuote;
    symbol: React.ReactNode;
}

function SettingsPriceFormat() {
    const { currencyQuote, setCurrencyQuote } = useStorage();
    const queryClient = useQueryClient();

    const handleQuoteChange = (quote: keyof CurrencyQuote) => {
        void setCurrencyQuote(quote);
        void queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    const samplePrice = 1500.50;

    const priceOptions: Array<PriceOption> = useMemo(() => [
        {
            example: currencyFormat(samplePrice, 'EUR'),
            label: 'Euro (EUR)',
            quote: 'EUR',
            symbol: <FaEuroSign className="text-lg" />,
        },
        {
            example: currencyFormat(samplePrice, 'USD'),
            label: 'US Dollar (USD)',
            quote: 'USD',
            symbol: <FaDollarSign className="text-lg" />,
        },
    ], []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priceOptions.map((option) => (
                <Card
                    className={`cursor-pointer transition-all ${currencyQuote === option.quote
                        ? 'border-2 border-blue-500 dark:border-blue-400'
                        : 'hover:border-gray-400'
                        }`}
                    key={option.quote}
                    onClick={() => { handleQuoteChange(option.quote); }}
                >
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <input
                                checked={currencyQuote === option.quote}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                id={`currency-format-${option.quote}`}
                                name="currency-format"
                                onChange={() => { handleQuoteChange(option.quote); }}
                                type="radio"
                            />
                            <Label
                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                                htmlFor={`currency-format-${option.quote}`}
                            >
                                <div className="flex items-center gap-2">
                                    {option.symbol}
                                    {option.label}
                                </div>
                            </Label>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Example: {option.example}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default SettingsPriceFormat;