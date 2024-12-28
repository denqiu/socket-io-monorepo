import { ESLintUtils } from "@typescript-eslint/utils";
import { RunTests } from "@typescript-eslint/rule-tester";

const ruleCreator = ESLintUtils.RuleCreator(
    (ruleName) => `https://github.com/denqiu/socket-io-monorepo/wiki/eslint-rules/${ruleName}`
);

/**
 * [code-review/comments, Comment Id: 01JEMXMWNC9BT4NBJKABG9FKBB]
 * 1. RuleManager is originally created as a type. The problem is reusing rule name for rule creation, rule tests, and plugins. Rule Creator does not have the name property even though though the property is introduced as an argument.
 * 2. Rule property with ruleName argument sends the rule name to Rule Creator. Implementation structure is working but not calling structure. See comments in rule property in the example.
 * @example
 * type RuleManager<RuleName extends string, MessageIds extends string, Options extends readonly unknown[] = []> = {
 *  ruleName: RuleName,
 *  rule: (ruleName: RuleName) => ESLintUtils.RuleModule<MessageIds, Options>,
 *  testCases: RunTests<MessageIds, Options>
 * };
 * const ruleManager: RuleManager<"a-rule", MessageIds, Options> = {
 *  ruleName: "a-rule",
 *  rule: (ruleName: RuleName) => {
 *      // Figured out implementation structure to send ruleName to ruleCreator.
 *      // However, ruleName property and calling rule("a-rule") are redundant. Calling structure is not working.
 *      // Converting RuleManager from type to class removes ruleName argument from rule property and resolves the calling structure issue.
 *      return ruleCreator<Options, MessageIds>({
 *          name: ruleName,
 *          ...
 *      });
 *  },
 *  testCases: {
 *      ...
 *  },
 * }
 */
class RuleManager {
    private ruleName: string;

    constructor(ruleName: string) {
        this.ruleName = ruleName;
    }

    getRuleName() {
        return this.ruleName;
    }

    /**
     * [code-review/comments, Comment Id: 01JEMXMWND3XNTY199NGCB4T9R]
     * Set up a new rule with its own MessageIds type and Options type and manages rule's name, rule, and test cases. 
     */
    setup<CustomProps, MessageIds extends string, Options extends readonly unknown[] = []>(props: { customProps: CustomProps, rule: () => ESLintUtils.RuleModule<MessageIds, Options>, testCases: RunTests<MessageIds, Options>}) {
        return {
            name: this.ruleName,
            rule: props.rule(),
            testCases: props.testCases,
            customProps: props.customProps,
        };
    }
}

export {
    ruleCreator,
    RuleManager
};