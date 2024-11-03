import React, { useMemo } from 'react';
import { Label, Card } from 'flowbite-react';
import { CurrencyQuote } from 'api';
import { useStorage } from '../hooks/useStorage';
import { useQueryClient } from '@tanstack/react-query';
import { FaEuroSign, FaDollarSign } from 'react-icons/fa';
import { currencyFormat } from '../utils/helpers';

interface PriceOption {
    quote: keyof CurrencyQuote;
    label: string;
    symbol: React.ReactNode;
    example: string;
}

const SettingsPriceFormat: React.FC = () => {
    const { setCurrencyQuote, currencyQuote } = useStorage();
    const queryClient = useQueryClient();

    const handleQuoteChange = (quote: keyof CurrencyQuote) => {
        setCurrencyQuote(quote);
        queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    const samplePrice = 1500.50;

    const priceOptions: PriceOption[] = useMemo(() => [
        {
            quote: 'EUR',
            label: 'Euro (EUR)',
            symbol: <FaEuroSign className="text-lg" />,
            example: currencyFormat(samplePrice, 'EUR'),
        },
        {
            quote: 'USD',
            label: 'US Dollar (USD)',
            symbol: <FaDollarSign className="text-lg" />,
            example: currencyFormat(samplePrice, 'USD'),
        },
    ], []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priceOptions.map((option) => (
                <Card
                    key={option.quote}
                    className={`cursor-pointer transition-all ${currencyQuote === option.quote
                        ? 'border-2 border-blue-500 dark:border-blue-400'
                        : 'hover:border-gray-400'
                        }`}
                    onClick={() => handleQuoteChange(option.quote)}
                >
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id={`currency-format-${option.quote}`}
                                name="currency-format"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                checked={currencyQuote === option.quote}
                                onChange={() => handleQuoteChange(option.quote)}
                            />
                            <Label
                                htmlFor={`currency-format-${option.quote}`}
                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
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