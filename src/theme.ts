import { createTheme } from 'flowbite-react';

export const customTheme = createTheme({
	button: {
		color: {
			primary: 'bg-green-500 hover:bg-green-600 text-white',
			failure: 'bg-red-600 hover:bg-red-700 text-white',
		},
	},
	sidebar: {
		root: {
			inner:
				'h-full overflow-y-auto overflow-x-hidden rounded px-3 py-4 dark:bg-gray-800 border-gray-200 bg-white shadow-md dark:border-gray-700',
		},
	},
	card: {
		root: {
			base: 'flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800',
		},
	},
	buttonGroup: {
		base: 'shadow-none',
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
