import schemaExample from "./sample/schemaExample.js";
import comments from "./codeReview/comments.js";

const sample = {
    rules: [schemaExample]
};

const codeReview = {
    rules: [comments]
};

/**
 * [code-review/comments, Comment Id: 01JEMXMXB4ECQ7BQ4TPJEPVWXS]
 * Simple pattern format that put plugins and rules together. Note that each rule has its own tests.
 * Setting them up feels like a hassle so I want to minimize setup time.
 * This is architecture-specific, not project-specific.
*/
export default {
    sample,
    codeReview,
};