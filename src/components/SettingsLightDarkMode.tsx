import { Card, useThemeMode } from 'flowbite-react';
import { FaCheck, FaMoon, FaSun } from 'react-icons/fa';

type ThemeMode = 'auto' | 'dark' | 'light';
type ThemeOption = {
	mode: ThemeMode;
	name: string;
	symbol: React.ReactNode;
};

function SettingsLightDarkMode({ className = '' }: { className?: string }) {
	const { computedMode, setMode } = useThemeMode();

	const handleModeChange = (mode: ThemeMode) => {
		setMode(mode);
	};

	const themeOptions: Array<ThemeOption> = [
		{
			mode: 'light',
			name: 'Light mode',
			symbol: <FaSun />,
		},
		{
			mode: 'dark',
			name: 'Dark mode',
			symbol: <FaMoon />,
		},
	];

	return (
		<div className={className}>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{themeOptions.map((option) => (
					<Card
						className={`cursor-pointer transition-colors ${
							computedMode === option.mode
								? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-90'
								: ''
						}`}
						key={option.mode}
						onClick={() => { handleModeChange(option.mode); }}
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
									<FaCheck className="text-primary-500" />
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
