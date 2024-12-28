import fs from "fs";
import path from "path";
import { sharedConfig } from "./eslint.config.js";

function editFile(eslintConfigName, file) {
	let fileContents = fs.readFileSync(file, "utf8");
	const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
	if (eslintConfigName === 'code-review.comments') {
		let editSharedConfig = new RegExp("return {(.+)};", "s").exec(sharedConfig.toString())?.[1] || "";
		editSharedConfig = editSharedConfig.replace(new RegExp("rules: \\{.+?\\}", "s"), "rules: {}");

		fileContents = fileContents.replace("./build/index.js", packageJson.name);
		fileContents = fileContents.replace(new RegExp("import.+sharedConfig.+"), "");
		fileContents = fileContents.replace(new RegExp("...sharedConfig.+"), editSharedConfig);
		fileContents = fileContents.replace(new RegExp(", \\{.+files.+?\n", "s"), ", {\n");
		fileContents = fileContents.replace(new RegExp("flagIssues: \\{.+?\\}", "s"), "flagIssues: {}");
	}
	return fileContents;
}

/**
 * [code-review/comments, Comment Id: 01JENSNZ18688714RMVXCNDQMM]
 * Copy eslint config file if not present with provided name from rules directory into current working directory.
 */
function createCopy(eslintConfigName) {
	const eslintConfigFile = `eslint.config.${eslintConfigName}.js`;
	if (!fs.existsSync(eslintConfigFile)) {
		console.error(`Eslint config file '${eslintConfigFile}' not found.`);
		return;
	}
	const fileContents = editFile(eslintConfigName, eslintConfigFile);
	const copiedFile = path.join(process.env.PWD, eslintConfigFile);
	if (fs.existsSync(copiedFile)) {
		console.log(`${fileContents}\n\nWill not overwrite Eslint config file '${eslintConfigFile}'. Review contents.`);
        return;
	}
	fs.writeFileSync(copiedFile, fileContents);
	console.log(`Created eslint config file '${eslintConfigFile}'.`);
}

const args = process.argv.slice(2);
createCopy(args[0]);