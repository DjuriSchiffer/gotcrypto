import { fixupPluginRules } from '@eslint/compat';
import importX from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import * as reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/* eslint-disable perfectionist/sort-objects */
/** @type {import("eslint").Linter.Config[]} */
export default [
	importX.flatConfigs.react,
	{
		files: ['**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
		...react.configs.flat.recommended,
		...react.configs.flat['jsx-runtime'],
	},
	{
		files: ['**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
		settings: {
			react: {
				version: 'detect',
			},
		},
		languageOptions: {
			globals: {
				...globals.serviceworker,
				...globals.browser,
			},
		},
		plugins: {
			'react-hooks': fixupPluginRules(reactHooks),
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react/function-component-definition': ['error', { namedComponents: 'function-declaration' }],
		},
	},
];
/* eslint-enable perfectionist/sort-objects */
