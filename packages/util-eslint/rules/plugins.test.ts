import { RuleTester } from "@typescript-eslint/rule-tester";
import setup from "./plugins/setup.js";
import * as vitest from "vitest";

//[code-review/comments, Comment Id: 01JEMXN404AGKNEDJ50FSCXX8E] See Vitest section in RULES-SETUP.md
//[code-review/comments, Comment Id: 01JEMXN404P32PRE9G4YV49CBV] Note: No need for vite config file. Simply passing file as command argument is enough.
RuleTester.afterAll = vitest.afterAll;
RuleTester.describe = vitest.describe;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;

/**
 * [code-review/comments, Comment Id: 01JEMXN404AXM1EWCPTHDFSG7M]
 * See https://typescript-eslint.io/packages/rule-tester/#type-aware-testing
 */
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts']
      },
      tsconfigRootDir: import.meta.dirname
    }
  }
});


Object.entries(setup).forEach(([pluginName, plugin]) => {
  RuleTester.describe(`Plugin suite: ${pluginName}`, () => {
    plugin.rules.forEach(rule => {
      RuleTester.it(`${rule.name}`, () => {
        ruleTester.run(rule.name, rule.rule, rule.testCases);
      })
    });
  });
});