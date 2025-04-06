import base from './eslint-config/base.js'
import react from './eslint-config/react.js'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	...base,
	...react,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
	},
	{
		ignores: [
			"coverage",
			"node_modules",
			"dist",
			"src/**/*.styled.ts",
			"src/**/*.styled.tsx",
		],
	},
	{
		files: ["**/*.spec.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-confusing-void-expression": "off",
		},
	},
];
