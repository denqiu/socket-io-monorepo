import fs from "fs";

/**
 * Originally oneliners in package.json but needed to modify multiple properties in multiple files. It's simpler to migrate logic into script.
 * 
 * Parsing errors ref:
 * 1. https://typescript-eslint.io/troubleshooting/typed-linting/#i-get-errors-telling-me--was-not-found-by-the-project-service-consider-either-including-it-in-the-tsconfigjson-or-including-it-in-allowdefaultproject
 * 2. https://typescript-eslint.io/troubleshooting/typed-linting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
 * @param {'prelint | postlint'} lintAction 
 * @example
 * prelint: "bash -c 'if grep -q \"//.*\\\"include\\\":\" tsconfig.json; then sed -i \"s/\\/\\/.*\\\"include\\\":/\\\"include\\\":/\" tsconfig.json; fi'"
 * postlint: "bash -c 'if ! grep -q \"//.*\\\"include\\\":\" tsconfig.json; then sed -i \"s/\\\"include\\\":/\\/\\/ \\\"include\\\":/\" tsconfig.json; fi'"
 */
function run(lintAction) {
	const properties = [
		{ file: "./tsconfig.json", property: '"include":' },
		// Disabling project related properties removes parsing errors like "ESLint was configured to run" or "not found by the project service".
		// OBSERVATION: The noted parsing errors appear on opening new file tab or switching to a different file tab.
		{ file: "./eslint.config.mjs", property: 'project:' },
		// { file: "./eslint.config.mjs", property: 'projectService:' },
		// { file: "./eslint.config.mjs", property: 'tsconfigRootDir:' },
	];
	for (const p of properties) {
		const fileContent = fs.readFileSync(p.file, "utf8");
		const commentRegex = new RegExp(`//.*?${p.property}`);
		if (lintAction === 'prelint' && commentRegex.test(fileContent)) {
			// enable property if disabled (uncomment property if commented out)
			fs.writeFileSync(p.file, fileContent.replace(commentRegex, p.property));
		} else if (lintAction === 'postlint' && !commentRegex.test(fileContent)) {
			// disable property if enabled (comment out property if uncommented)
			fs.writeFileSync(p.file, fileContent.replace(p.property, `// ${p.property}`));
		}
	}
}

const args = process.argv.slice(2);
run(args[0]);