import fs from "fs";
import path from "path";

//[code-review/comments, Comment Id: 01JENMF5GHSHP51F7A9E22A0C5] Update: Not needed anymore.
//[code-review/comments, Comment Id: 01JENMF5GHR25J9K9K139MAP00] Keeping track of how to use this for reference in package.json. "lint": "bash -c \"pnpm --filter @dqiu/util-eslint lint:helper prelint && pnpm gts lint; exitError=$?; pnpm --filter @dqiu/util-eslint lint:helper postlint; exit $exitError\"",

/**
 * [code-review/comments, Comment Id: 01JENMF5GJYYMBAGREGQ0M9ARN]
 * Originally oneliners in root level package.json but needed to modify multiple properties in multiple files. It's simpler to migrate logic into script.
 * 
 * Parsing errors ref:
 * 1. https://typescript-eslint.io/troubleshooting/typed-linting/#i-get-errors-telling-me--was-not-found-by-the-project-service-consider-either-including-it-in-the-tsconfigjson-or-including-it-in-allowdefaultproject
 * 2. https://typescript-eslint.io/troubleshooting/typed-linting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
 * @param {'prelint' | 'postlint' | string} lintAction 
 * @example
 * prelint: "bash -c 'if grep -q \"//.*\\\"include\\\":\" tsconfig.json; then sed -i \"s/\\/\\/.*\\\"include\\\":/\\\"include\\\":/\" tsconfig.json; fi'"
 * postlint: "bash -c 'if ! grep -q \"//.*\\\"include\\\":\" tsconfig.json; then sed -i \"s/\\\"include\\\":/\\/\\/ \\\"include\\\":/\" tsconfig.json; fi'"
 */
function run(lintAction) {
    const properties = {
		//[code-review/comments, Comment Id: 01JENMF5GJ583CAKCZT7WDDPNZ] root folder
		[process.env.PWD]: [
			{ property: '"include":', filePath: ["tsconfig.json"] },
			//[code-review/comments, Comment Id: 01JENMF5GJRE15RH9KNWN6W32M] Disabling project related properties removes parsing errors like "ESLint was configured to run" or "not found by the project service".
			//[code-review/comments, Comment Id: 01JENMF5GJPR8XTED5KVCDDWBG] OBSERVATION: The noted parsing errors appear on opening new file tab or switching to a different file tab.
			{ property: 'project:', filePath: ["eslint.config.mjs"] },
			//[code-review/comments, Comment Id: 01JENMF5GJYKFP0YQ0RM6NTQSQ] { property: 'projectService:', filePath: ["eslint.config.mjs"] },
			//[code-review/comments, Comment Id: 01JENMF5GKSHZQ64MVDAK7VYFY] { property: 'tsconfigRootDir:', filePath: ["eslint.config.mjs"] },
		],
		//[code-review/comments, Comment Id: 01JENMF5GKYG4QEE6XRW2H8FTQ] rules folder in util-eslint package
		//[code-review/comments, Comment Id: 01JENMF5GKX0VS4XJD8YYBNWP9] Update: Found no problems keeping these properties uncommented. Helped resolve problems with tsconfig in root folder. Don't need this file anymore. On second thought not resolved.
		
		//[code-review/comments, Comment Id: 01JENMF5GK4CVNVNH58DD3B2FH] [path.join(import.meta.dirname, "rules")]: [
		//[code-review/comments, Comment Id: 01JENMF5GMRX6HVJWZGY3MDJJF] 	{ property: '"include":', filePath: ["tsconfig.json"] },
		//[code-review/comments, Comment Id: 01JENMF5GM42Z3ZDFQ4NBZPSK0] 	{ property: 'project:', filePath: ["eslint.config.js"] }
		//[code-review/comments, Comment Id: 01JENMF5GM4Q92TVZQDZYA1YH9] ]
	};
	for (const p of properties[process.cwd()]) {
        const file = path.join(process.env.PWD, ...p.filePath);
		const fileContent = fs.readFileSync(file, "utf8");
		const commentRegex = new RegExp(`//.*?${p.property}`);
		if (lintAction === 'prelint' && commentRegex.test(fileContent)) {
			//[code-review/comments, Comment Id: 01JENMF5GM6BVGMXBFSZY0RF7S] enable property if disabled (uncomment property if commented out)
			fs.writeFileSync(file, fileContent.replace(commentRegex, p.property));
		} else if (lintAction === 'postlint' && !commentRegex.test(fileContent)) {
			//[code-review/comments, Comment Id: 01JENMF5GNH0BMKJE9WMES3TSP] disable property if enabled (comment out property if uncommented)
			fs.writeFileSync(file, fileContent.replace(p.property, `// ${p.property}`));
		}
	}
}

const args = process.argv.slice(2);
run(args[0]);