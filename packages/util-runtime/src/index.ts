/**
 * [code-review/comments, Comment Id: 01JEMYS06MW059QB91NYMJGDX6]
 * Handles undefined variables that can break the app.
 */
const RuntimeUtil = {
    nodeProcess: typeof process !== 'undefined' && process,
    browserWindow: typeof window !== 'undefined' && window
};

export default RuntimeUtil;