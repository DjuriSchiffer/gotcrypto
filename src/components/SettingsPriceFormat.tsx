import type { CurrencyQuote } from 'api';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from 'flowbite-react';
import { useMemo } from 'react';
import { FaDollarSign, FaEuroSign, FaCheck } from 'react-icons/fa';
import { useStorage } from '../hooks/useStorage';
import { currencyFormat } from '../utils/helpers';

type PriceOption = {
	example: string;
	name: string;
	quote: keyof CurrencyQuote;
	symbol: React.ReactNode;
};

function SettingsPriceFormat({ className = '' }: { className?: string }) {
	const { currencyQuote, setCurrencyQuote } = useStorage();
	const queryClient = useQueryClient();

	const handleQuoteChange = (quote: keyof CurrencyQuote) => {
		void setCurrencyQuote(quote);
		void queryClient.invalidateQueries({ queryKey: ['fetchedCurrencies'] });
	};

	const samplePrice = 1500.5;

	const priceOptions: Array<PriceOption> = useMemo(
		() => [
			{
				example: currencyFormat(samplePrice, 'EUR'),
				name: 'Euro (EUR)',
				quote: 'EUR',
				symbol: <FaEuroSign />,
			},
			{
				example: currencyFormat(samplePrice, 'USD'),
				name: 'US Dollar (USD)',
				quote: 'USD',
				symbol: <FaDollarSign />,
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
							<div className="shrink-0 text-gray-700 dark:text-white">{option.symbol}</div>
							<div className="flex min-w-0 flex-1 flex-col items-start text-gray-700">
								<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
									{option.name}
								</h5>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Example: {option.example}
								</p>
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

export default SettingsPriceFormat;
