import { Button } from "flowbite-react";
import { HiOutlineCurrencyDollar, HiOutlineCurrencyEuro } from "react-icons/hi";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { CurrencyQuote } from "api";
import { useQueryClient } from '@tanstack/react-query';
import { useAppState } from "../hooks/useAppState";

export function ChangeQuote() {
    const { currencyQuote } = useAppState();
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    const handleCurrencyQuote = (quote: keyof CurrencyQuote) => {
        dispatch({
            type: 'SET_CURRENCY_QUOTE',
            payload: quote,
        });

        queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
    };

    return (
        <Button.Group>
            <Button
                color={currencyQuote === 'EUR' ? 'dark' : 'gray'}
                onClick={() => handleCurrencyQuote('EUR')}
            >
                <HiOutlineCurrencyEuro className="mr-1" />
                Euro
            </Button>
            <Button
                color={currencyQuote === 'USD' ? 'dark' : 'gray'}
                onClick={() => handleCurrencyQuote('USD')}
            >
                <HiOutlineCurrencyDollar className="mr-1" />
                Dollar
            </Button>
        </Button.Group>
    );
}