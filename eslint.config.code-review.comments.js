import tseslint from 'typescript-eslint';
import jslint from "@eslint/js";
import { plugins, configCodeReview } from "@dqiu-util-eslint/rules";
import { sharedConfig } from './eslint.config';
import { turnOffJavascriptRules, turnOffTypescriptRules } from '@dqiu/util-eslint';

const config = configCodeReview();
config.checkGitignore();
const commentsFile = config.clearFileIfPresent("comments.txt");
const issuesAwaitingCreationFile = config.clearFileIfPresent("issues-awaiting-creation.txt");
const issuesCreatedFile = config.clearFileIfPresent("issues-created.txt");

export default tseslint.config({
	ignores: sharedConfig.ignores,
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
		...turnOffJavascriptRules,
		...turnOffTypescriptRules,
	}
}, {
	plugins: {
		'code-review': plugins.codeReview,
	},
	rules: {
	// 	'code-review/comments': ["warn", { 
	// 		ruleName: 'code-review/comments', commentsFile: commentsFile, issuesCreatedFile: issuesCreatedFile, issuesAwaitingCreationFile: issuesAwaitingCreationFile, 
	// 		/**
    // * [code-review/comments, Comment Id: 01JENSNZ0N3ZMBECKAK1Y39FEE]
	// 		 * FORMAT:
	// 		 * [Comment ULID]: Issue Url
	// 		 * 
	// 		 * If issue url is empty comment goes into issuesAwaitingCreationFile, otherwise comment goes into issuesCreatedFile.
	// 		 */
	// 		flagIssues: {}
	// 	}],
	}
});