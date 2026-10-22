import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
	...tseslint.configs.recommendedTypeChecked,
	prettierConfig,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-deprecated": "warn",
			"no-restricted-globals": [
				"error",
				{ name: "setTimeout", message: "Use window.setTimeout for popout window compatibility." },
				{ name: "setInterval", message: "Use window.setInterval for popout window compatibility." },
				{ name: "clearTimeout", message: "Use window.clearTimeout for popout window compatibility." },
			],
		},
	},
	{
		ignores: ["node_modules/**", "main.js", "eslint.config.mjs"],
	},
);
