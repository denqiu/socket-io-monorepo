import fs from "fs";
import path from "path";

function toReferencePath(packageTsconfig) {
	const relativePath = path.relative(process.env.PWD, packageTsconfig);
	const linuxFormat = "./" + relativePath.replace(/\\/g, "/");
	return { path: linuxFormat };
}

/**
 * Generate path references for all packages.
 * 1. If package exists, add to paths. Otherwise warn that TsConfig file doesn't exist.
 * 2. Copy paths output into references property in tsconfig.json.
 */
function run() {
	const currentDirectory = import.meta.dirname;
	const packageNames = fs.readdirSync(currentDirectory).filter(p => fs.statSync(path.join(currentDirectory, p)).isDirectory());
	let paths = [];
	let packageTsconfig;
	for (const pkg of packageNames) {
		packageTsconfig = path.join(currentDirectory, pkg, "tsconfig-package.json");
		if (fs.existsSync(packageTsconfig)) {
			paths.push(toReferencePath(packageTsconfig));
		} else {
			console.warn(`[Warning] TsConfig file not found for package '${pkg}'.`);
		}
	}
	const stringifyPaths = JSON.stringify(paths, null, 2);
	console.log(stringifyPaths);
	console.log('Copy and paste into "references" property.');
}

run();