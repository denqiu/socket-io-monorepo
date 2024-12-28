<h1>TODOs</h1>

<h2>GitHub Actions or Apps</h2>
<ol>
    <li>Automate and manage repo settings</li>
    <li>Update: See https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages. 
    <br>
    Automate syncing readme files into wiki. if readme deleted we can recover from wiki. If updated in wiki it will be updated in codebase too. Also may be useful to create a separate wiki folder for local only that contains same project paths and hard links to markdown files in same locations.</li>
    <li>Manage ticket labels. use eisenhower matrix</li>
</ol>

Create file comment searcher - simply scan entire codebase for files that contain comments, // and /**/. Could be expanded for programming languages in general, not just javascript. Code GPT app on ChatGPT-4o mini suggested ASTRL and Tree-sitter, use cases are creating programming languages and language-aware processing. Comment searcher is too simple, no need for them. VSCode IDE implements tree sitter so we can simply use the search function for that. The purpose of comment searcher is to help gather comments talking about a problem and put them into ticketing system. Doing this manually is better because it's hard to differentiate between a comment explaining things vs a issue that should be documented as a ticket. Makes it more obvious to find later. UPDATE: On second thought, I don't like using regex to vscode search for comments. If tree sitter natively recognizes comments

note eslint/tsconfig issues in a ticket, current solution which might be a bit of a hack (to remove problems in Problems tab) and goal solution is to really understand why errors occur as they do and how to solve them better.

move vitest section in RULE-SETUP.md in util-eslint/rules to separate .md file. Done. Vitest file hard linked in frameworks folder.

revise setup demo and rule tester markdown with my own way of explaining unit testing and integration testing. Eventually, replace ai with human writing because i'm communicating with humans. I think there's room for improvement to simplify explanations.

review codebase use of typescript against article: https://dev.to/balrajola/unpopular-opinion-typescript-is-overrated-or-is-it-o31. I agree that typescript can be super useful and could be super restrictive on js code. I found interfaces are not helpful. I'm not fan of setting up tsconfig - takes a while to figure out how to do it well, though when done well, it does it's job well.