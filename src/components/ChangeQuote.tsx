import { Button } from "flowbite-react";
import { FaDollarSign, FaEuroSign } from "react-icons/fa";
import { CurrencyQuote } from "api";
import { useQueryClient } from '@tanstack/react-query';
import { useStorage } from "../hooks/useStorage";

export function ChangeQuote() {
    const { setCurrencyQuote, currencyQuote } = useStorage();
    const queryClient = useQueryClient();

    const handleCurrencyQuote = (quote: keyof CurrencyQuote) => {
        setCurrencyQuote(quote)
        queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    return (
        <Button.Group>
            <Button
                color={currencyQuote === 'EUR' ? 'dark' : 'gray'}
                onClick={() => handleCurrencyQuote('EUR')}
            >
                <FaEuroSign className="mr-1" />
                Euro
            </Button>
            <Button
                color={currencyQuote === 'USD' ? 'dark' : 'gray'}
                onClick={() => handleCurrencyQuote('USD')}
            >
                <FaDollarSign className="mr-1" />
                Dollar
            </Button>
        </Button.Group>
    );
}