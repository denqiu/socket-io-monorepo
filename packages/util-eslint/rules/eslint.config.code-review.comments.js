import tseslint from 'typescript-eslint';
import jslint from "@eslint/js";
import { ESLint, Linter } from '@typescript-eslint/utils/ts-eslint';
import { plugins, customProps, ConfigCodeReview } from "./build/index.js";
import { sharedConfig } from './eslint.config.js';

//[code-review/comments, Comment Id: 01JENSNZ0FMC8W0NE7D8Q20RA4] Create script in package.json - "comments": "eslint . --fix --config eslint.config.code-review.comments.js"
// update command: node eslint.config.code-review.comments.js
// update: instead of having to copy file, configure processing issues as json or js object file or markdown file being passed to command line.

const config = new ConfigCodeReview();
config.clearConfigFolder();
config.checkGitignore();

const { createIssueTracker, getEndingMessage } = customProps.codeReview.rules.comments;
const issueTracker = createIssueTracker((filename) => config.createFile(filename));
// setup tracker to take in issues from json and remove trackIssue method.
issueTracker.trackIssue({
	nickname: "sample_1",
	description: "Sample issue awaiting creation.",
	url: "",
	commentIds: {
		[String.raw`demo\codeReview\comments\block\example.ts`]: ["01JEXQKQWYT6MZ3DMN7EWYC6KF"]
	}
});
issueTracker.trackIssue({
	nickname: "sample_2",
	description: "Sample issue created.",
	url: "<Issue Url Goes Here>",
	commentIds: {
		[String.raw`demo\codeReview\comments\line\example.ts`]: ["01JEXQKR12G31XBZ573C2HQN50"]
	}
});
issueTracker.trackIssue({ // TODO: Create new comment testcase
	nickname: "sample_3",
	description: "Issue awaiting creation. Id originally existed but was later deleted and replaced with a new Id. Original and new Ids are mismatched.",
	url: "",
	commentIds: {
		[String.raw`demo\codeReview\comments\line\example.ts`]: ["invalid-id-1", "invalid-id-2", "01JEXQKR12G31XBZ573C2HQN53"]
	}
});
issueTracker.trackIssue({ // TODO: Create new comment testcase
	nickname: "sample_4",
	description: "Issue created. Id originally existed but was later deleted and replaced with a new Id. Original and new Ids are mismatched.",
	url: "<Issue Url Goes Here>",
	commentIds: {
		[String.raw`demo\codeReview\comments\line\example.ts`]: ["", "  ", "empty-string-is-invalid-id"]
	}
});

const baseConfig = [{
		...sharedConfig(tseslint, jslint)
	}, {
	settings: {
		trackFilepaths: [],
		issueTracker: issueTracker, // don't want to put this in options because schema cant handle classes
		endingMessage: "",
	},
	/**
  * [code-review/comments, Comment Id: 01JENSNZ0NV0ZR8C1H0BJVFTCG]
	 * Command: pnpm comments
	 * Test code-review/comments rule on demo/codeReview/comments folder. Linter should ignore everything else.
	 */
	files: ["demo/codeReview/comments/**/*.ts"],
	plugins: {
		'code-review': plugins.codeReview,
	},
	rules: {
		/**
		 * @type {[Linter.SeverityString, typeof plugins.codeReview.rules.comments.defaultOptions[0]]}
		 */
		'code-review/comments': ["warn", { 
			ruleName: 'code-review/comments',
			reviewType: 'commentsAndFilepaths',
			filepaths: {
				comments: config.createFile("comments.txt"),
                viewFilepaths: config.createFile("view-filepaths.txt")
			},
		}],
	}
}];

(async () => {
	const eslint = new ESLint({
		baseConfig: tseslint.config(...baseConfig),
		fix: true,
		cwd: process.cwd()
	});
	const results = await eslint.lintFiles([]);
	await ESLint.outputFixes(results);
	issueTracker.warnInvalidCommentIds();
	issueTracker.fixMismatchedCommentIds(config.createFile("issues-mismatched-ids.html"));
	console.log(`Done! ${getEndingMessage()}`);
})();