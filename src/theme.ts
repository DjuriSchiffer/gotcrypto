import { createTheme } from 'flowbite-react';

export const customTheme = createTheme({
	button: {
		color: {
			failure:
				'bg-red-600 text-white focus:ring-4 focus:ring-red-300 enabled:hover:bg-red-700 dark:focus:ring-red-900',
			primary:
				'bg-primary-600 text-white focus:ring-4 focus:ring-primary-300 enabled:hover:bg-primary-700 dark:focus:ring-primary-800',
		},
	},
	buttonGroup: {
		base: 'shadow-none',
	},
	card: {
		root: {
			base: 'flex rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
			children: 'flex h-full flex-col justify-start gap-4 p-6',
		},
	},
	tabs: {
		tablist: {
			tabitem: {
				variant: {
					underline: {
						active: {
							on: 'rounded-t-lg border-b-2 border-green-500 text-green-500 dark:border-green-500 dark:text-green-500',
						},
					},
				},
			},
		},
	},
});

export const cardTable = createTheme({
	card: {
		root: {
			base: 'overflow-hidden',
			children: 'p-0',
		},
	},
});
