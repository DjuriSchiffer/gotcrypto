import { Card, useThemeMode } from 'flowbite-react';
import { FaMoon, FaSun, FaCheck } from 'react-icons/fa';

type ThemeMode = 'light' | 'dark' | 'auto';
type ThemeOption = {
	name: string;
	mode: ThemeMode;
	symbol: React.ReactNode;
};

function SettingsLightDarkMode({ className = '' }: { className?: string }) {
	const { computedMode, setMode } = useThemeMode();

	const handleModeChange = (mode: ThemeMode) => {
		void setMode(mode);
	};

	const themeOptions: Array<ThemeOption> = [
		{
			name: 'Light mode',
			mode: 'light',
			symbol: <FaSun />,
		},
		{
			name: 'Dark mode',
			mode: 'dark',
			symbol: <FaMoon />,
		},
	];

	return (
		<div className={`${className}`}>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{themeOptions.map((option) => (
					<Card
						key={option.mode}
						onClick={() => handleModeChange(option.mode)}
						className={`cursor-pointer transition-colors ${
							computedMode === option.mode
								? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
								: ''
						}`}
					>
						<div className="flex items-center space-x-2">
							<div className="shrink-0 text-gray-700 dark:text-white">{option.symbol}</div>
							<div className="flex min-w-0 flex-1 items-center">
								<h5 className="text-sm font-bold leading-none text-gray-700 dark:text-white">
									{option.name}
								</h5>
							</div>
							{computedMode === option.mode && (
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

export default SettingsLightDarkMode;
