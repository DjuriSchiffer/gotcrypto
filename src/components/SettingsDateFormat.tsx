import type { DateLocale } from 'store';
import { Card } from 'flowbite-react';
import { useMemo } from 'react';
import { FaCheck } from 'react-icons/fa';
import { useStorage } from '../hooks/useStorage';
import { dateForDisplay } from '../utils/helpers';

type DateOption = {
	example: string;
	name: string;
	locale: DateLocale;
};

function SettingsDateFormat({ className = '' }: { className?: string }) {
	const { dateLocale, setDateLocale } = useStorage();

	const handleLocaleChange = (locale: DateLocale) => {
		void setDateLocale(locale);
	};

	const dateOptions: Array<DateOption> = useMemo(() => {
		const sampleDate = new Date('2024-03-15T12:00:00.000Z');

		return [
			{
				example: dateForDisplay(sampleDate.toISOString(), 'nl'),
				name: 'European (DD-MM-YYYY)',
				locale: 'nl',
			},
			{
				example: dateForDisplay(sampleDate.toISOString(), 'en'),
				name: 'American (MM-DD-YYYY)',
				locale: 'en',
			},
		];
	}, []);

	return (
		<div className={`${className}`}>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{dateOptions.map((option) => (
					<Card
						key={option.locale}
						onClick={() => handleLocaleChange(option.locale)}
						className={`cursor-pointer transition-colors ${
							dateLocale === option.locale
								? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
								: ''
						}`}
					>
						<div className="flex items-center space-x-2">
							<div className="flex min-w-0 flex-1 flex-col items-start text-gray-700">
								<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
									{option.name}
								</h5>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Example: {option.example}
								</p>
							</div>
							{dateLocale === option.locale && (
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

export default SettingsDateFormat;
