import base from './eslint-config/base.js';
import react from './eslint-config/react.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
	...base,
	...react,
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
			'vite.config.*',
			'postcss.config.ts',
			'node_modules',
			'dist',
		],
	},
	{
		files: ['**/*.{spec,test}.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-confusing-void-expression': 'off',
		},
	},
];
