import tseslint from 'typescript-eslint';
import jslint from "@eslint/js";
import { turnOffJavascriptRules, turnOffTypescriptRules } from "@dqiu/util-eslint";

export const sharedConfig = {
	ignores: ["**/build/**", "src/frontend/frameworks/**", "**/eslint.config*.js"],
};

/**
 * How to get started:
 * 1. https://eslint.org/docs/latest/use/configure/migration-guide#packagejson-configuration-no-longer-supported
 * 2. https://typescript-eslint.io/getting-started/typed-linting
 * 3. https://typescript-eslint.io/troubleshooting/typed-linting
 */
export default tseslint.config({
	/**
	 * Linting is applied to these files.
	 */
	files: ["tests/**/*.js", "src/backend/**/*.js", "src/frontend/client/**/*.js", "packages/**/*.{js,ts}"],
	/**
	 * Fixes the exact same parsing error that was fixed in tsconfig.json's include prop.
	 */
	ignores: sharedConfig.ignores,
	/**
	 * Sets up recommended rules. See https://typescript-eslint.io/packages/typescript-eslint#flat-config-extends.
	 */
	extends: [
		jslint.configs.recommended,
		...tseslint.configs.recommendedTypeChecked,
	],
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			projectService: true,
		},
	},
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	rules: {
		...turnOffJavascriptRules,
		...turnOffTypescriptRules,
		/**
		 * References:
		 * 1. https://typescript-eslint.io/rules/no-for-in-array/
		 * 2. https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-for-in-array.ts
		 */
		'@typescript-eslint/no-for-in-array': 'error',
		/**
		 * TODO: Easy to custom implement. Packages are implemented at project level, so there are stuff shared between backend and frontend. But there are certain things that should be used only in backend and not in frontend, and vice versa, i.e., builders should be imported in backend but throw error if imported in frontend.
		 */
		/**
		 * Block non-recommendations from codebase setup.
		 */
	}
});