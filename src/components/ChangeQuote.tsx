import type { CurrencyQuote } from 'api';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from 'flowbite-react';
import { useMemo } from 'react';
import { FaDollarSign, FaEuroSign, FaCheck } from 'react-icons/fa';
import { useStorage } from '../hooks/useStorage';

type PriceOption = {
	quote: keyof CurrencyQuote;
	symbol: React.ReactNode;
	name: string;
};

export function ChangeQuote({ className = '' }: { className?: string }) {
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
				symbol: <FaEuroSign className="text-lg" />,
				name: 'Euro',
			},
			{
				quote: 'USD',
				symbol: <FaDollarSign className="text-lg" />,
				name: 'US Dollar',
			},
		],
		[]
	);

	return (
		<div className={`${className}`}>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{priceOptions.map((option) => (
					<Card
						key={option.quote}
						onClick={() => handleQuoteChange(option.quote)}
						className={`cursor-pointer transition-colors ${
							currencyQuote === option.quote
								? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
								: ''
						}`}
					>
						<div className="flex items-center space-x-2">
							<div className="shrink-0">{option.symbol}</div>
							<div className="flex min-w-0 flex-1 items-center">
								<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
									{option.name}
								</h5>
							</div>
							{currencyQuote === option.quote && (
								<div className="flex-shrink-0">
									<FaCheck className="text-green-500" />
								</div>
							)}
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
