import fs from "fs";
import path from "path";
import setup from "./plugins/setup.js";

/**
 * [code-review/comments, Comment Id: 01JEMXMVBYCNW1SCC88DW4TPWM]
 * Generate demo code.
 * 
 * Note: We aren't using the compiled demo folder in build. We don't need to care about recompiling after generating demo.
 * 
 * 1. Clear demo folder.
 * 2. Create plugin folder.
 * 3. Create rule folder. Use test case filenames to create files under this folder.
 * 4. valid and invalid properties are arrays of test cases. Each test case must have a name property otherwise throw error.
 * 5. Represent each test case as a function. Map test cases to provided filenames. If filename is not provided, set "demo" as the default filename.
 * 6. If test case name is a duplicate, add a number to make it unique and avoid duplicate function compiler errors.
 */
function generateDemo() {
    const demoFolder = "demo";
    fs.rmSync(demoFolder, { recursive: true, force: true});
    fs.mkdirSync(demoFolder);

    const trackTestCaseNames: { [name: string]: number } = {};
    Object.entries(setup).forEach(([pluginName, plugin]) => {
        fs.mkdirSync(path.join(demoFolder, pluginName));
        plugin.rules.forEach(rule => {
            const rulePath = path.join(demoFolder, pluginName, rule.name);
            fs.mkdirSync(rulePath);
            const { valid, invalid } = rule.testCases;
            for (const testCase of valid) {
                if (typeof testCase === 'string') {
                    //[code-review/comments, Comment Id: 01JEMXMVBYSBV5046WNSA9PAP3] This is source code. Throw error because name property is required.
                    throw new Error("Name property is required to represent testcase as a function.");
                } else if (!testCase.name) {
                    throw new Error("Name property is required to represent testcase as a function.");
                }
                if (testCase.name in trackTestCaseNames) {
                    trackTestCaseNames[testCase.name] += 1;
                } else {
                    trackTestCaseNames[testCase.name] = 0;
                }
                const testCaseName = trackTestCaseNames[testCase.name] === 0 ? testCase.name : `${testCase.name}_${trackTestCaseNames[testCase.name]}`;
                const func = (testCase.skip)
                    ? `// Skipped valid test case '${testCaseName}'\n\n`
                    : `function valid_${testCaseName}() {\n${testCase.code}\n}\n\n`;
                if (testCase.filename) {
                    fs.mkdirSync(path.join(rulePath, path.dirname(testCase.filename)), { recursive: true });
                    fs.appendFileSync(path.join(rulePath, testCase.filename), func);
                } else {
                    fs.appendFileSync(path.join(rulePath, "demo.ts"), func);
                }
            }
            for (const testCase of invalid) {
                if (!testCase.name) {
                    throw new Error("Name property is required to represent testcase as a function.");
                } 
                if (testCase.name in trackTestCaseNames) {
                    trackTestCaseNames[testCase.name] += 1;
                } else {
                    trackTestCaseNames[testCase.name] = 0;
                }
                const testCaseName = trackTestCaseNames[testCase.name] === 0 ? testCase.name : `${testCase.name}_${trackTestCaseNames[testCase.name]}`;
                const func = (testCase.skip)
                    ? `// Skipped invalid test case '${testCaseName}'\n\n`
                    : `function invalid_${testCaseName}() {\n${testCase.code}\n}\n\n`;
                if (testCase.filename) {
                    fs.mkdirSync(path.join(rulePath, path.dirname(testCase.filename)), { recursive: true });
                    fs.appendFileSync(path.join(rulePath, testCase.filename), func);
                } else {
                    fs.appendFileSync(path.join(rulePath, "demo.ts"), func);
                }
            }
        });
    });
    console.log("Generated demo folder successfully! Next, add new plugins and rules to eslint.config.js.")
}

generateDemo();