<h1>Packages</h1>

<h2>Labeling Package Importance</h2>
UPDATE: Make changes later. Logic will be moved to neo4j. Also check out code maps.
<ol>
    <li>Package names are kept as is. No need to prefix level of importance, i.e., <code>util-event</code>.</li>
    <li>Folder names are prefixed with level of importance, i.e., <code>important-1_util-event</code>.</li>
    <li>Added to provide visual clarity on which package(s) are important and which package(s) are less important or not used at all, i.e., <code>important, support, not-used</code>. Numbers matter, i.e., <code>important-1</code> should represent the most important package, <code>important-2</code> should be the second important package, <code>support-1</code> is the first helper package, etc.</li>
    <li>Run <code>pnpm tsconfig:references</code> to generate path references. Then copy and paste into tsconfig's references property. Easier to do than trying to handle comments in json file.</li>
</ol>

<h2>After <code>eslint.config.mjs</code> was Created</h2>
<ul>
    <li>To re-compile ALL packages, run <code>pnpm clean && pnpm compile</code>. No compile error if a package depends on another package.</li>
    <li>To re-compile SPECIFIC packages, run <code>pnpm clean package-1 package-2 && pnpm compile package-1 package-2</code>. Note that order matters if package-1 depends on package-2. A compile error will appear because package-2 would have to be compiled first. Workaround is to re-compile all packages.</li>
</ul>

<h2>Before <code>eslint.config.mjs</code> was Created</h2>
<ol>
    <li>To re-compile package, remove <code>.tsbuildinfo</code> file.</li>
    <li>If any pre-compiled files (.ts) were deleted and they were compiled, delete the compiled files (.d.ts, .js) in the <code>build</code> directory or simply delete the <code>build</code> directory.</li>
    <li>Finally, run <code>pnpm compile</code>.</li>
</ol>