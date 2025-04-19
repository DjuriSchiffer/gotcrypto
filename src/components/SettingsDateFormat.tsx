import type { DateLocale } from 'store';

import { Card, Label } from 'flowbite-react';
import { useMemo } from 'react';

import { useStorage } from '../hooks/useStorage';
import { dateForDisplay } from '../utils/helpers';

type DateOption = {
	example: string;
	label: string;
	locale: DateLocale;
};

function SettingsDateFormat() {
	const { dateLocale, setDateLocale } = useStorage();

	const handleLocaleChange = (locale: DateLocale) => {
		void setDateLocale(locale);
	};

	const dateOptions: Array<DateOption> = useMemo(() => {
		const sampleDate = new Date('2024-03-15T12:00:00.000Z');

		return [
			{
				example: dateForDisplay(sampleDate.toISOString(), 'nl'),
				label: 'European (DD-MM-YYYY)',
				locale: 'nl',
			},
			{
				example: dateForDisplay(sampleDate.toISOString(), 'en'),
				label: 'American (MM-DD-YYYY)',
				locale: 'en',
			},
		];
	}, []);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{dateOptions.map((option) => (
				<Card
					className={`cursor-pointer transition-all ${
						dateLocale === option.locale
							? 'border-2 border-green-500 dark:border-green-400'
							: 'hover:border-gray-400'
					}`}
					key={option.locale}
					onClick={() => {
						handleLocaleChange(option.locale);
					}}
				>
					<div className="flex items-center space-x-2">
						<div className="flex items-center">
							<input
								checked={dateLocale === option.locale}
								className="h-4 w-4 border-gray-300 bg-gray-100 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-green-600"
								id={`date-format-${option.locale}`}
								name="date-format"
								onChange={() => {
									handleLocaleChange(option.locale);
								}}
								type="radio"
							/>
							<Label
								className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
								htmlFor={`date-format-${option.locale}`}
							>
								{option.label}
							</Label>
						</div>
					</div>
					<div className="mt-2">
						<p className="text-sm text-gray-500 dark:text-gray-400">Example: {option.example}</p>
					</div>
				</Card>
			))}
		</div>
	);
}

export default SettingsDateFormat;
