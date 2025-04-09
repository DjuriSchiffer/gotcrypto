import type { CurrencyQuote } from "api";

import { useQueryClient } from '@tanstack/react-query';
import classNames from "classnames";
import { Button } from "flowbite-react";
import { useMemo } from "react";
import { FaDollarSign, FaEuroSign } from "react-icons/fa";

import { useStorage } from "../hooks/useStorage";

type PriceOption = {
    quote: keyof CurrencyQuote;
    symbol: React.ReactNode;
}

export function ChangeQuote({ className }: { className: string }) {
    const { currencyQuote, setCurrencyQuote } = useStorage();
    const queryClient = useQueryClient();

    const handleQuoteChange = (quote: keyof CurrencyQuote) => {
        void setCurrencyQuote(quote);
        void queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    const priceOptions: Array<PriceOption> = useMemo(() => [
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
                    className={classNames('w-6/12', {
                        '!border-blue-400': currencyQuote === option.quote,
                        '!border-l-[1px]': index > 0 && currencyQuote === option.quote,
                        'border-l': index > 0 && currencyQuote === option.quote,
                    })}
                    color={currencyQuote === option.quote ? 'dark' : 'gray'}
                    key={index}
                    onClick={() => { handleQuoteChange(option.quote); }}
                >
                    {option.symbol}
                    {option.quote}
                </Button>
            ))}
        </Button.Group>
    );
}