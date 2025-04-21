import type { CurrencyQuote } from 'api';

import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { Button, ButtonGroup } from 'flowbite-react';
import { useMemo } from 'react';
import { FaDollarSign, FaEuroSign } from 'react-icons/fa';

import { useStorage } from '../hooks/useStorage';

type PriceOption = {
	quote: keyof CurrencyQuote;
	symbol: React.ReactNode;
};

export function ChangeQuote({ className }: { className: string }) {
	const { currencyQuote, setCurrencyQuote } = useStorage();
	const queryClient = useQueryClient();

	const handleQuoteChange = (quote: keyof CurrencyQuote) => {
		void setCurrencyQuote(quote);
		void queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
	};

	const priceOptions: Array<PriceOption> = useMemo(
		() => [
			{
				quote: 'EUR',
				symbol: <FaEuroSign className="mr-1" />,
			},
			{
				quote: 'USD',
				symbol: <FaDollarSign className="mr-1" />,
			},
		],
		[]
	);

	const getButtonStyles = (quote: keyof CurrencyQuote) => {
		const isActive = currencyQuote === quote;

		return isActive
			? 'bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-dark dark:hover:bg-gray-900 dark:text-white'
			: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200';
	};

	return (
		<ButtonGroup className={className}>
			{priceOptions.map((option, index) => (
				<Button
					className={classNames('w-6/12 !border-0', getButtonStyles(option.quote), {
						'z-10 !border-[1px] !border-green-400 dark:!border-green-500':
							currencyQuote === option.quote,
						'!rounded-l-lg': index === 0,
						'!rounded-r-lg': index === priceOptions.length - 1,
						'!rounded-none': index > 0 && index < priceOptions.length - 1,
						'!first:border-l-0': index === 0,
					})}
					color="gray"
					key={index}
					onClick={() => {
						handleQuoteChange(option.quote);
					}}
				>
					{option.symbol}
					{option.quote}
				</Button>
			))}
		</ButtonGroup>
	);
}
