import { Button } from "flowbite-react";
import { FaDollarSign, FaEuroSign } from "react-icons/fa";
import { CurrencyQuote } from "api";
import { useQueryClient } from '@tanstack/react-query';
import { useStorage } from "../hooks/useStorage";
import { useMemo } from "react";
import classNames from "classnames";

interface PriceOption {
    quote: keyof CurrencyQuote;
    symbol: React.ReactNode;
}

export function ChangeQuote({ className }: { className: string }) {
    const { setCurrencyQuote, currencyQuote } = useStorage();
    const queryClient = useQueryClient();

    const handleQuoteChange = (quote: keyof CurrencyQuote) => {
        setCurrencyQuote(quote);
        queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    const priceOptions: PriceOption[] = useMemo(() => [
        {
            quote: 'EUR',
            symbol: <FaEuroSign className="mr-1" />,
        },
        {
            quote: 'USD',
            symbol: <FaDollarSign className="mr-1" />,
        },
    ], []);

    return (
        <Button.Group className={className}>
            {priceOptions.map((option, index) => (
                <Button
                    key={index}
                    color={currencyQuote === option.quote ? 'dark' : 'gray'}
                    onClick={() => handleQuoteChange(option.quote)}
                    className={classNames('w-6/12', {
                        '!border-blue-400': currencyQuote === option.quote,
                        'border-l': index > 0 && currencyQuote === option.quote,
                        '!border-l-[1px]': index > 0 && currencyQuote === option.quote,
                    })}
                >
                    {option.symbol}
                    {option.quote}
                </Button>
            ))}
        </Button.Group>
    );
}