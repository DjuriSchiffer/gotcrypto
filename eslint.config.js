import base from './eslint-config/base.js';
import react from './eslint-config/react.js';
import tailwindcss from 'eslint-plugin-tailwindcss';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	...base,
	...react,
	...tailwindcss.configs['flat/recommended'],
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},
	{
		ignores: [
			'coverage',
			'src/env.d.ts',
			'eslint-config',
			'vite.config.ts',
			'postcss.config.ts',
			'node_modules',
			'dist',
		],
	},
	{
		files: ['**/*.spec.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-confusing-void-expression': 'off',
		},
	},
	{
		settings: {
			tailwindcss: {
				callees: ['twMerge', 'createTheme'],
				classRegex: '^(class(Name)|theme)?$',
			},
		},
	},
];
