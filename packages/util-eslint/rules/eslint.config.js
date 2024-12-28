import tseslint from 'typescript-eslint';
import jslint from "@eslint/js";
import { plugins } from "./build/index.js";
import setup from "./build/plugins/setup.js";

export function sharedConfig(tseslint, jslint) {
	return {
		ignores: ["**/build/**", "**/eslint.config*.js"],
		/**
	  * [code-review/comments, Comment Id: 01JENSNZ1WBJM6YAV411CZETRJ]
		 * Lint entire project.
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
			'@typescript-eslint': tseslint.plugin
		},
		rules: {
			'prefer-const': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
		}
	};
}

export default tseslint.config({
		...sharedConfig(tseslint, jslint)
	}, {
	/**
  * [code-review/comments, Comment Id: 01JENSNZ1WHNN4EW3EXK0F8PZF]
	 * Test plugins/rules on demo folder. Linter should ignore everything else.
	 */
	files: ["demo/**/*.ts"],
	plugins: {
		'sample': {
			rules: Object.fromEntries(setup.sample.rules.map(rule => [rule.name, rule.rule]))
		},
	},
	/**
  * [code-review/comments, Comment Id: 01JENSNZ1XGKJ0DWHMQ5ZQTPK9]
	 * Rule severity options: https://eslint.org/docs/latest/use/configure/rules#rule-severities
	 */
	rules: {
		'sample/schema-example': ["error", { disallowedNames: ["foo", "bar"] }],
	}
});