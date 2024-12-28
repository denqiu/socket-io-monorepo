//[code-review/comments, Comment Id: 01JEMXMTB25VWSAWZ4VCDD1VGR] collate comments from each file into .code-search file
//[code-review/comments, Comment Id: 01JEMXMTB3VC6G2GJ40X05M4N8] sometimes, an issue that should be written as a ticket is a comment.
//[code-review/comments, Comment Id: 01JEMXMTB3W6V1M3FW42EXKERA] othertimes, comments describe purpose of code, how it works, and plain english high level logic on why it's implemented.
//[code-review/comments, Comment Id: 01JEMXMTB3W96188KV6A5N9JMM] should allow dev ability to manually flag comments that describe code or issue

import fs from "fs";
import path from "path";
import { ruleCreator, RuleManager } from "../ruleHelper.js";
import { AST_TOKEN_TYPES } from "@typescript-eslint/utils";
import * as ulidx from "ulidx";
import json2md from "json2md";
import { marked } from 'marked';

const endingOutput = {
    message: "",
    isDone: false
};

const IssueType = {
    awaiting_creation: 'issues-awaiting-creation',
    created: 'issues-created'
};

class IssueTracker {
    createFile: (filename: string) => string;

    filepaths: { [nickname: string]: string } = {};
    invalidCommentIds: { [nickname: string]: string[] } = {};
    mapIssueComments: { [commentId: string]: { nickname: string, sourceFilename: string } } = {};
    trackCommentsByFile: { [sourceFilename: string]: { id: string, value: string }[] } = {};

    constructor(createFile) {
        this.createFile = createFile;
    }

    /**
     * This occurs before config setup inside eslint file.
     * 
     * STEPS:
     * 
     * 1. Determine issue type by checking whether provided url is empty or not. If empty, issue awaits creation. Otherwise, treat url as created issue.
     * 2. Create relevant .txt file associated with issue's nickname. Use config from eslint file to clear file if present.
     * 3. Append issue's description and url to .txt file.
     * 4. Validate and add comment Ids associated with issue. Map them to nickname. Map will be used in rule's create function, step 5, to find nickname associated with comment Id. 
     * 5. Invalid comment Ids will be skipped and trigger warning notification.
     * 6. See {@link appendComment}.
     * @param nickname A shorter, compact description of the issue. Can be a keyword, tag name, group name, title, or some other identifier. Note that nickname needs to be valid to be able to create a file in step 2.
     * @param description Description of issue.
     * @param url Issue's url.
     * @param commentIds Track source files and associated comment Ids, all related to issue.
     */
    trackIssue(props: { nickname: string, description: string, url: string, commentIds: { [sourceFilename: string]: string[] }}) {
        const isUrlEmpty = props.url.trim() === '';
        const issueType = (isUrlEmpty) ? IssueType.awaiting_creation : IssueType.created;

        this.filepaths[props.nickname] = this.createFile(path.join(issueType, `${props.nickname}.txt`));
        const issueFile = this.filepaths[props.nickname];

        fs.appendFile(issueFile, `Issue url: ${isUrlEmpty ? "<Awaiting Creation>" : props.url}\n\n${props.description}\n\n`, () => {});
        Object.entries(props.commentIds).forEach(([sourceFilename, commentIds]) => {
            for (const commentId of commentIds) {
                if (ulidx.isValid(commentId)) {
                    this.mapIssueComments[commentId] = { nickname: props.nickname, sourceFilename: sourceFilename };
                } else {
                    if (!(props.nickname in this.invalidCommentIds)) {
                        this.invalidCommentIds[props.nickname] = [];
                    }
                    this.invalidCommentIds[props.nickname].push(commentId);
                }
            }
        });
    }

    /**
     * This is used inside rule's create function.
     * 
     * STEPS:
     * 
     * 6. Check if comment Id is associated with an issue or not. Use case is that Id originally exists but later on Id was deleted. Comment has to regenerate a new Id. Ids are mismatched.
     * 7. If comment Id is associated with an issue, we can find their relevant nicknames and append them to their relevant .txt files. Then remove valid Id from Issue Comments map.
     * 8. If comment Id is not associated with an issue, it's either a regular comment or a comment associated with an issue with a regenerated Id that is not recognized. Comments are appended to comments file.
     * 9. Issue Comments map is left with original Ids. Ids are mismatched. See {@link fixMismatchedCommentIds}
     */
    appendComment(commentId: string, sourceFilename: string, commentLines: string, commentValue: string, commentsFile: string) {
        if (commentId in this.mapIssueComments) {
            // Comment is associated with an issue.
            const { nickname } = this.mapIssueComments[commentId];
            const issueFile = this.filepaths[nickname];
            fs.appendFile(issueFile, `${sourceFilename}\nLines: ${commentLines}\n${commentValue}\n\n`, () => {});
            delete this.mapIssueComments[commentId];
        } else {
            // Comment is not associated with an issue.
            if (!(sourceFilename in this.trackCommentsByFile)) {
                this.trackCommentsByFile[sourceFilename] = [];
            }
            this.trackCommentsByFile[sourceFilename].push({ id: commentId, value: commentValue });
            fs.appendFile(commentsFile, `${sourceFilename}\nLines: ${commentLines}\n${commentValue}\n\n`, () => {});
        }
    }

    /**
     * This occurs after running ESLint instance.
     * 
     * Reference: html-demo/radio-options.html
     * 
     * ENHANCEMENT: Upgrade logic from text files to apis and db. This eliminates need to repopulate same set of comments for every original comment id. Keep text files logic as backup in the unlikely event that apis and dbs don't work for whatever reason in the moment. For example, setup textFiles | apis type. apis type can go textFiles method if api stop working in the moment though that's unlikely.
     * 
     * STEPS: 
     * 
     * 9. Create markdown content for issues-mismatched-ids.html. Write issue's nickname and original comment Ids to markdown. Then associate each original Id with sourceFilename.
     * 10. Associate comments for each sourceFilename and list them out as options.
     * 11. Manually review comments and find matching comments to replace original Id with regenerated Id. Mark option buttons.
     * 12. After completing review, enter command line to start replacement process. Markdown file deletes itself. We're done!
     */
    fixMismatchedCommentIds(htmlFile: string) {
        if (endingOutput.isDone) {
            // Review type is filepaths only. No need to fix mismatched Ids.
            return;
        }
        endingOutput.isDone = true;
        if (Object.keys(this.mapIssueComments).length === 0) {
            // Found no mismatched comment Ids.
            return;
        }
        const mapIssues: { [nickname: string]: { [sourceFilename: string]: { originalCommentId: string }[] } } = {};
        Object.entries(this.mapIssueComments).forEach(([originalCommentId, issue]) => {
            const { nickname, sourceFilename } = issue;
            if (!(nickname in mapIssues)) {
                mapIssues[nickname] = {};
            }
            if (!(sourceFilename in mapIssues[nickname])) {
                mapIssues[nickname][sourceFilename] = [];
            }
            mapIssues[nickname][sourceFilename].push({ originalCommentId: originalCommentId });
        });

        const markdown: json2md.Data[] = [];
        markdown.push({ h1: "Issues: Find Mismatched Comment Ids" });
        
        const form: json2md.Data[] = [];
        let index = 0;
        for (const [nickname, sourceFiles] of Object.entries(mapIssues)) {
            form.push({ h2: `Issue: ${nickname}` });

            for (const [sourceFilename, items] of Object.entries(sourceFiles)) {
                form.push({ h3: `Source File: ${sourceFilename}` });

                const comments = this.trackCommentsByFile[sourceFilename];
                items.forEach(item => {
                    form.push({ h3: `Original Comment Id: ${item.originalCommentId}` });

                    const fieldset: json2md.Data[] = [];
                    fieldset.push({ legend: "Comments" });
                    for (const comment of comments) {
                        index++;
                        const inputId = `comment_${index}`;
                        fieldset.push({
                            p: [
                                { 
                                    input: {
                                        attributes: `type="radio" id="${inputId}" name="${item.originalCommentId}" value="${comment.id}"`,
                                    }
                                },
                                {
                                    label: {
                                        attributes: `for="${inputId}"`,
                                        text: comment.value
                                    }
                                }
                            ]
                        });
                    }
                    form.push({ fieldset: fieldset });
                });
                form.push({ hr: {} });
            }
        }
        form.push({ button: {
            attributes: `type="submit"`,
            text: "Submit and Review"
        }});
        markdown.push({ form: form });

        markdown.push({ div: {
            attributes: "id='result'",
            content: "Selected Comments: "
        }});
        markdown.push({ script: 
            `document.querySelector('form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                let selectedValues = {};
                
                for (let [name, value] of formData.entries()) {
                    selectedValues[name] = value;
                }
                
                const resultDiv = document.getElementById('result');
                
                let resultHTML = '<h3>Selected Comments:</h3>';
                for (let [name, value] of Object.entries(selectedValues)) {
                    resultHTML += \`<p><strong>\${name}:</strong> \${value}</p>\`;
                }
                resultDiv.innerHTML = resultHTML;
            });`
        });
        // Override default converters to keep HTML tag in markdown.
        json2md.converters.h1 = function(input, json2md) {
            return `<h1>${input}</h1>`;
        };    
        json2md.converters.h2 = function(input, json2md) {
            return `<h2>${input}</h2>`;
        };    
        json2md.converters.h3 = function(input, json2md) {
            return `<h3>${input}</h3>`;
        };    
        // Additional converters for more HTML.    
        json2md.converters.legend = function(input, json2md) {
            return `<legend>${input}</legend>`;
        };
        json2md.converters.input = function(input, json2md) {
            return `<input ${input.attributes}></input>`;
        };
        json2md.converters.label = function(input, json2md) {
            return `<label ${input.attributes}>${input.text}</label>`;
        };
        json2md.converters.fieldset = function(input, json2md) {
            return `<fieldset>${json2md(input)}</fieldset>`;
        };
        json2md.converters.button = function(input, json2md) {
            return `<button ${input.attributes}>${input.text}</button>`;
        };
        json2md.converters.div = function(input, json2md) {
            return `<div ${input.attributes}>${input.content}</div>`;
        };
        json2md.converters.form = function(input, json2md) {
            return `<form>\n${json2md(input)}</form>`;
        };
        json2md.converters.script = function(input, json2md) {
            return `<script>${input}</script>`;
        };
        
        const markdownToHtml = marked(json2md(markdown), { async: false });
        const fullHtmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mismatched Comment IDs Review</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                fieldset { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
                legend { font-weight: bold; }
                label { display: block; margin-bottom: 5px; }
                button { display: block; margin: 20px auto; padding: 10px 20px; }
            </style>
        </head>
        <body>
            ${markdownToHtml}
        </body>
        </html>
        `;
        fs.writeFile(htmlFile, fullHtmlContent, () => {});
        console.error(`Please review mismatched comment Ids in '${htmlFile}'.`);
    }

    /**
     * This occurs after running ESLint instance.
     * 
     * Warn invalid comment Ids in tracked issues.
     */
    warnInvalidCommentIds() {
        const invalidIds = Object.entries(this.invalidCommentIds).map(([nickname, commentIds]) => `Issue '${nickname}': ${commentIds.join(", ")}.`);
        console.warn(`Skipped invalid comment Ids.\n${invalidIds.join("\n")}`);
    }
}

type MessageIds = "none";

const defaultOptions = [{
    ruleName: "",
    reviewType: "" as "filepathsOnly" | "commentsAndFilepaths",
    filepaths: {
        comments: "",
        viewFilepaths: "",
    },
    clearComments: [] as { filename: string, keepCommentIds: string[] }[]
}];

const ruleManager = new RuleManager("comments");

type CustomProps = {
    createIssueTracker: (createFile) => IssueTracker;
    getEndingMessage: () => string;
};

/**
 * Ref: https://github.com/denqiu/socket-io-monorepo/issues/13
 */
export default ruleManager.setup<CustomProps, MessageIds, typeof defaultOptions>({
    customProps: {
        createIssueTracker: (createFile) => new IssueTracker(createFile),
        getEndingMessage: () => endingOutput.message,
    },
    rule: () => {
        return ruleCreator<typeof defaultOptions, MessageIds>({
            name: ruleManager.getRuleName(),
            meta: {
                type: 'suggestion',
                fixable: 'code',
                docs: {
                    description: "Export comments to text files for review.",
                },
                messages: {
                    none: "No messages available for this rule."
                },
                schema: [{
                    type: "object",
                    properties: {
                        ruleName: { type: "string" },
                        reviewType: { type: "string" },
                        filepaths: {
                            type: "object",
                            properties: {
                                comments: { type: "string" },
                                viewFilepaths: { type: "string" }
                            },
                            additionalProperties: false
                        },
                    },
                    additionalProperties: false
                }],
            },
            defaultOptions: defaultOptions,
            /**
             * [code-review/comments, Comment Id: 01JEMXMTB4TH0ND9B6VGESEE4D]
             * OVERVIEW:
             * 1. Group comments by source file and append to comments file.
             * 2. Display each comment with line numbers and generated Comment Id.
             * 3. Add Comment Id to every comment in source files.
             * 4. If Comment Id is flagged as issue, move to issue file (awaiting creation or created).
             * 
             * Comment Id format: [pluginName/ruleName, Comment Id: <uid>] comment string
             * 
             * STEPS:
             * 1. Observed fixer appending multiple comment Ids to comment, regardless of function used (replaceText, insertTextAfterRange).
             * 2. Comment modification was treated as a new comment and had fixes re-applied, creating cyclical logic.
             * 3. To resolve this, check comment format if it exists, inside for loop and outside fixer function.
             * 4. If comment format doesn't exist, modify comment and continue loop.
             * 5. If comment format exists, append to comments file.
             */
            create(context) {     
                const { ruleName, reviewType, filepaths } = context.options[0];   
                const sourceFilename = path.relative(context.cwd, context.filename);    

                const trackFilepaths = context.settings.trackFilepaths as string[];
                const issueTracker = context.settings.issueTracker as IssueTracker;

                if (!trackFilepaths.includes(sourceFilename)) {
                    trackFilepaths.push(sourceFilename);
                    fs.appendFile(filepaths.viewFilepaths, `${sourceFilename}\n`, () => {}); 
                }
                if (reviewType === 'filepathsOnly') {
                    // Don't review comments. Exit here.
                    endingOutput.message = `See '${filepaths.viewFilepaths}'.`;
                    endingOutput.isDone = true;
                    return {};
                } else if (reviewType === 'commentsAndFilepaths') {
                    // Go review comments.
                    endingOutput.message = `See '${filepaths.comments}', issues in folders '${IssueType.awaiting_creation}' and '${IssueType.created}', and '${filepaths.viewFilepaths}'.`;
                }
                //[code-review/comments, Comment Id: 01JEMXMTB4R5QMVTQMAYEBBX4S] 'm' flag accounts for block comments.
                const commentIdRegex = new RegExp(`\\[${ruleName}, Comment Id: (.+)\\]`, "m");
                for (const comment of context.sourceCode.getAllComments()) {
                    if (commentIdRegex.test(comment.value)) {
                        //[code-review/comments, Comment Id: 01JEMXMTB4HMTKYDJ3NPR12CMM] STEP 5
                        const commentLines = (comment.type === AST_TOKEN_TYPES.Line) ? `${comment.loc.start.line}` : `${comment.loc.start.line} - ${comment.loc.end.line}`;
                        const commentValue = (comment.type === AST_TOKEN_TYPES.Line) ? `//${comment.value}` : `/*${comment.value.replace(/^\s*/mg, "")}*/`;
                        const commentId = commentIdRegex.exec(comment.value)?.[1] || "";
                        issueTracker.appendComment(commentId, sourceFilename, commentLines, commentValue, filepaths.comments);
                    } else {
                        //[code-review/comments, Comment Id: 01JEMXMTB5EZVC2E1TSD73R307] STEP 4
                        // TODO: Group comments by specified file. All comment ids in file will be removed. This is ignore comments feature.
                        const commentFormat = `[${ruleName}, Comment Id: ${ulidx.monotonicFactory()()}]`;
                        context.report({
                            loc: comment.loc,
                            messageId: "none",
                            fix(fixer) {
                                if (comment.type === AST_TOKEN_TYPES.Line) {
                                    //[code-review/comments, Comment Id: 01JEMXMTB6KQN6JGXR5D4NA3FY] Insert Comment Id after "//".
                                    const insertPosition = comment.range[0] + 2;
                                    return fixer.insertTextAfterRange([comment.range[0], insertPosition], commentFormat);
                                }
                                //[code-review/comments, Comment Id: 01JEMXMTB67GVKEKZBTXGMG8XK] Insert Comment Id and a new line after "/**". New line is used to separate comment Id and original comment on IDE hover capability.
                                const leadingWhitespace = ` ${" ".repeat(comment.loc.start.column)}`;
                                const insertPosition = comment.range[0] + 3;
                                return fixer.insertTextAfterRange([comment.range[0], insertPosition], `\n${leadingWhitespace}* ${commentFormat}\n${leadingWhitespace}*`);
                            }
                        });
                    }
                }
                return {};
            }
        });
    },
    testCases: {
        valid: [
            {
                name: "lineComment",
                code: "// Single-line comment",
                filename: "line/example.ts"
            },
            {
                name: "anotherLineComment",
                code: "// Another single-line comment",
                filename: "line/example.ts"
            },
            {
                name: "issueCreatedComment",
                code: "// This issue was created.",
                filename: "line/example.ts"
            },
            {
                name: "blockComment",
                code: `
                   /**
                    * Sample description.
                    * This is a block comment.
                    */
                `,
                filename: "block/example.ts"
            },
            {
                name: "anotherBlockComment",
                code: `
                   /**
                    * Sample description.
                    * This is another block comment.
                    */
                `,
                filename: "block/example.ts"
            },
            {
                name: "issueAwaitingCreationBlockComment",
                code: `
                   /**
                    * Sample description.
                    * This issue is waiting to be created.
                    */
                `,
                filename: "block/example.ts"
            }
        ],
        invalid: [
            {
                name: "comments",
                code: "",
                skip: true,
                options: defaultOptions,
                errors: [],
            },
            {
                name: "anotherOne",
                code: "",
                skip: true,
                options: defaultOptions,
                errors: [],
            }
        ],
    }
});