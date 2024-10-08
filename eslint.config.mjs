import tseslint from 'typescript-eslint';

/**
 * How to get started:<br>
 * 1. https://eslint.org/docs/latest/use/configure/migration-guide#packagejson-configuration-no-longer-supported
 * 2. https://typescript-eslint.io/getting-started/typed-linting
 * 3. https://typescript-eslint.io/troubleshooting/typed-linting
 */
export default tseslint.config(
	{
		/**
		 * Fixes the exact same parsing error that was fixed in tsconfig.json's include prop.
		 */
		ignores: ["**/eslint.config.js"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				/**
				 * Much faster than projectService and tsconfigRootDir
				 */
				project: true,
				// projectService: true,
				// tsconfigRootDir: import.meta.dirname
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			/**
			 * References:<br>
			 * 1. https://typescript-eslint.io/rules/no-for-in-array/
			 * 2. https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-for-in-array.ts
			 */
			'@typescript-eslint/no-for-in-array': 'error',
		},
	}
);