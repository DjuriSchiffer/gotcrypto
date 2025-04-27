import { Card, Label, useThemeMode } from 'flowbite-react';
import { FaMoon, FaSun } from 'react-icons/fa';

type ThemeMode = 'light' | 'dark' | 'auto';
type ThemeOption = {
	label: string;
	mode: ThemeMode;
	symbol: React.ReactNode;
};

function SettingsLightDarkMode() {
	const { computedMode, setMode } = useThemeMode();

	const handleModeChange = (mode: ThemeMode) => {
		void setMode(mode);
	};

	const themeOptions: Array<ThemeOption> = [
		{
			label: 'Light mode',
			mode: 'light',
			symbol: <FaSun className="text-lg" />,
		},
		{
			label: 'Dark mode',
			mode: 'dark',
			symbol: <FaMoon className="text-lg" />,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{themeOptions.map((option) => (
				<Card
					className={`cursor-pointer transition-all ${
						computedMode === option.mode
							? 'border-2 border-green-500 dark:border-green-400'
							: 'hover:border-gray-400'
					}`}
					key={option.mode}
					onClick={() => {
						handleModeChange(option.mode);
					}}
				>
					<div className="flex items-center space-x-2">
						<div className="flex items-center">
							<input
								checked={computedMode === option.mode}
								className="h-4 w-4 border-gray-300 bg-gray-100 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-green-600"
								id={`mode-${option.mode}`}
								name="mode"
								onChange={() => {
									handleModeChange(option.mode);
								}}
								type="radio"
							/>
							<Label
								className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
								htmlFor={`mode-${option.mode}`}
							>
								<div className="flex items-center gap-2">
									{option.symbol}
									{option.label}
								</div>
							</Label>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

export default SettingsLightDarkMode;
