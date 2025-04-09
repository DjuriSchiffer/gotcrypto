import type { DateLocale } from 'store';

import { Card, Label } from 'flowbite-react';
import { useMemo } from 'react';

import { useStorage } from '../hooks/useStorage';
import { dateForDisplay } from '../utils/helpers';

type DateOption = {
    example: string;
    label: string;
    locale: DateLocale;
}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dateOptions.map((option) => (
                <Card
                    className={`cursor-pointer transition-all ${dateLocale === option.locale
                        ? 'border-2 border-blue-500 dark:border-blue-400'
                        : 'hover:border-gray-400'
                        }`}
                    key={option.locale}
                    onClick={() => { handleLocaleChange(option.locale); }}
                >
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <input
                                checked={dateLocale === option.locale}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                id={`date-format-${option.locale}`}
                                name="date-format"
                                onChange={() => { handleLocaleChange(option.locale); }}
                                type="radio"
                            />
                            <Label
                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                                htmlFor={`date-format-${option.locale}`}
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