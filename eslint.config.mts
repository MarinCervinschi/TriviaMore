import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: [
			".next/**",
			"node_modules/**",
			"dist/**",
			"build/**",
			"backups/**",
			"*.config.js",
			"*.config.mjs",
		],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		plugins: {
			"react-hooks": pluginReactHooks,
			"@next/next": pluginNext,
		},
		rules: {
			...pluginReactHooks.configs.recommended.rules,

			// Next.js specific rules
			"@next/next/no-html-link-for-pages": "error",
			"@next/next/no-img-element": "error",
			"@next/next/no-unwanted-polyfillio": "error",
			"@next/next/no-page-custom-font": "error",

			// React specific rules
			"react/react-in-jsx-scope": "off", // Not needed in Next.js
			"react/prop-types": "off", // Using TypeScript instead

			// TypeScript specific rules
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "off",

			// General code quality rules
			"prefer-const": "error",
			"no-var": "error",
			"no-console": ["warn", { allow: ["warn", "error"] }],
			eqeqeq: ["error", "always"],
			"curly": ["error", "all"],
		},
	}
);
