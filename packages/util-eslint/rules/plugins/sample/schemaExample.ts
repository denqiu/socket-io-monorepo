import { ruleCreator, RuleManager } from "../ruleHelper.js";

type MessageIds = "disallowedName";

/**
 * [code-review/comments, Comment Id: 01JEMXN3MDHZYV5MHHTPZ0J6AP]
 * Fixes disallowedNames in defaultOptions prop being treated as type `never[]` and compiler error triggered on `node.name` in `Identifier`.
 */
type Options = [{ disallowedNames: string[] }];

const ruleManager = new RuleManager("schema-example");

/**
 * See https://eslint.org/docs/latest/extend/custom-rules#options-schemas
 * 
 * See https://eslint.org/docs/latest/extend/custom-rules#option-defaults
 */
export default ruleManager.setup<null, MessageIds, Options>({
    customProps: null,
    rule: () => {
        return ruleCreator<Options, MessageIds>({
            name: ruleManager.getRuleName(),
            meta: {
                type: 'suggestion',
                docs: {
                    description: "Disallow specified variable names.",
                },
                messages: {
                    disallowedName: "The variable '{{ name }}' is disallowed."
                },
                schema: [
                    {
                        type: "object",
                        properties: {
                            disallowedNames: {
                                type: "array",
                                items: { type: "string" },
                                default: []
                            }
                        },
                        required: ["disallowedNames"],
                        additionalProperties: false
                    }
                ],
            },
            defaultOptions: [{ disallowedNames: []}], //[code-review/comments, Comment Id: 01JEMXN3MD00TFZ4XKB1A2BHQY] Fixes compile error at `context.options[0]`: Tuple type '[]' of length '0' has no element at index '0'.
            create(context) {
                const { disallowedNames = [] } = context.options[0] || {};
                return {
                    Identifier(node) {
                        if (disallowedNames.includes(node.name)) {
                            context.report({
                                node,
                                messageId: "disallowedName",
                                data: { name: node.name }
                            });
                        }
                    }
                };
            }
        });
    },
    testCases: {
        valid: [
            {
                name: "allowedVariable",
                code: "let allowedVariable = 42;", //[code-review/comments, Comment Id: 01JEMXN3MD08MTRGEKHGDY6VK0] Valid because 'allowedVariable' is not disallowed
                options: [{ disallowedNames: ["disallowedVariable"] }],
            },
            {
                name: "anotherAllowed",
                code: "const anotherAllowed = 'example';", //[code-review/comments, Comment Id: 01JEMXN3MDSR858B04T3JPV0H6] Valid with no disallowed variables
                options: [{ disallowedNames: [] }], //[code-review/comments, Comment Id: 01JEMXN3MEAG9N2111KV39GY8A] Empty disallowedNames list
            },
        ],
        invalid: [
            {
                name: "disallowedVariable",
                code: "let disallowedVariable = 42;", //[code-review/comments, Comment Id: 01JEMXN3MEBQNPA080BN3ZHS2B] Invalid because 'disallowedVariable' is disallowed
                options: [{ disallowedNames: ["disallowedVariable"] }],
                errors: [
                    {
                        messageId: "disallowedName",
                        data: { name: "disallowedVariable" },
                    },
                ],
            },
            {
                name: "foobar",
                code: `
                    const foo = 10;
                    const bar = 20;
                `, //[code-review/comments, Comment Id: 01JEMXN3ME5RRJ5MEQYPG1MBKG] Invalid because 'foo' and 'bar' are disallowed
                options: [{ disallowedNames: ["foo", "bar"] }],
                errors: [
                    {
                        messageId: "disallowedName",
                        data: { name: "foo" },
                    },
                    {
                        messageId: "disallowedName",
                        data: { name: "bar" },
                    },
                ],
            },
        ],
    }
});