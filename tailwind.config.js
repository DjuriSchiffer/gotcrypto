const flowbiteReact = require('flowbite-react/plugin/tailwindcss');
const colors = require('tailwindcss/colors');

const config = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
		'./node_modules/tailwind-datepicker-react/dist/**/*.js',
		'.flowbite-react/class-list.json',
	],
	darkMode: 'class',
	plugins: [require('flowbite/plugin'), flowbiteReact],
	theme: {
		extend: {
			colors: {
				dark: '#1e293b',
				emerald: colors.emerald,
				gray: {
					...colors.gray,
					DEFAULT: '#8492a6',
				},
				'gray-dark': '#1e2126',
				grayLight: '#6B7280', // Same as gray-500,
				green: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#10b981',
					700: '#10b981',
					800: '#10b981',
					900: '#10b981',
					dark: {
						DEFAULT: '#34d399', //400
						on: '#ecfdf5', //800
					},
					DEFAULT: '#34d399', //500
					on: '#ecfdf5', //50
				},
				light: colors.light,
				primary: colors.indigo,
				white: '#ffffff',
			},
		},
	},
};

module.exports = config;
