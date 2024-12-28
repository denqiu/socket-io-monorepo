import fs from 'fs';
import path from 'path';
import setup from "./plugins/setup.js";

class ConfigCodeReview {
    configFolder: string;

    constructor() {
        this.configFolder = "code-review";
    }
    
    /**
     * Clear config folder.
     * 
     * STEPS:
     * 1. Forcefully and recursively delete everything in config folder.
     * 2. Create empty config folder.
     */
    clearConfigFolder() {
        fs.rmSync(this.configFolder, { recursive: true, force: true });
        fs.mkdirSync(this.configFolder);
    }

    /**
     * Create file path.
     * 
     * STEPS:
     * 1. Create file path.
     * 2. Recursively create directories if they don't exist.
     */
    createFile(filename: string) {
        const file = path.join(this.configFolder, filename);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        return file;
    }

    /**
     * [code-review/comments, Comment Id: 01JEMXMSJGH0D3HXVNB8V50XKR]
     * 
     * STEPS: 3 checks, otherwise pass because config folder is added to .gitignore.
     * 1. If .gitignore doesn't exist, throw error.
     * 2. If config folder is not added to .gitignore, throw error.
     * 3. If config folder is commented out, throw error.
     */
    checkGitignore() {
        const gitignore = path.join(process.cwd(), ".gitignore");
        if (!fs.existsSync(gitignore)) {
            throw new Error(`Create .gitignore and add '${this.configFolder}' folder.`);
        }
        const gitignoreContent = fs.readFileSync(gitignore, "utf8");
        if (gitignoreContent.includes(this.configFolder)) {
            const commentRegex = new RegExp(`#.*?${this.configFolder}`);
            if (commentRegex.test(gitignoreContent)) {
                throw new Error(`Uncomment '${this.configFolder}' folder in .gitignore.`);
            }
        } else {
            throw new Error(`Add '${this.configFolder}' folder to .gitignore.`);
        }
    }
}

const plugins = {
    //[code-review/comments, Comment Id: 01JEMXMSJJB4BQ1ACMMEDBFZ7H] sample plugin is only used for demo/testing purposes. No need for export.
    codeReview: {
        rules: Object.fromEntries(setup.codeReview.rules.map(rule => [rule.name, rule.rule]))
    },
};

const customProps = {
    codeReview: {
        rules: Object.fromEntries(setup.codeReview.rules.map(rule => [rule.name, rule.customProps]))
    },
};

export {
    ConfigCodeReview,
    plugins,
    customProps
};