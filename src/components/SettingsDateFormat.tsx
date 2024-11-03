import React, { useMemo } from 'react';
import { Label, Card } from 'flowbite-react';
import { dateForDisplay } from '../utils/helpers';
import { DateLocale } from 'store';
import { useStorage } from '../hooks/useStorage';

interface DateOption {
    locale: DateLocale;
    label: string;
    example: string;
}

const SettingsDateFormat: React.FC = () => {
    const { setDateLocale, dateLocale } = useStorage();

    const handleLocaleChange = (locale: DateLocale) => {
        setDateLocale(locale);
    };

    const sampleDate = new Date('2024-03-15T12:00:00.000Z');

    const dateOptions: DateOption[] = useMemo(() => [
        {
            locale: 'nl',
            label: 'European (DD-MM-YYYY)',
            example: dateForDisplay(sampleDate.toISOString(), 'nl'),
        },
        {
            locale: 'en',
            label: 'American (MM-DD-YYYY)',
            example: dateForDisplay(sampleDate.toISOString(), 'en'),
        },
    ], []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dateOptions.map((option) => (
                <Card
                    key={option.locale}
                    className={`cursor-pointer transition-all ${dateLocale === option.locale
                        ? 'border-2 border-blue-500 dark:border-blue-400'
                        : 'hover:border-gray-400'
                        }`}
                    onClick={() => handleLocaleChange(option.locale)}
                >
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id={`date-format-${option.locale}`}
                                name="date-format"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                checked={dateLocale === option.locale}
                                onChange={() => handleLocaleChange(option.locale)}
                            />
                            <Label
                                htmlFor={`date-format-${option.locale}`}
                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                            >
                                {option.label}
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

export default SettingsDateFormat;