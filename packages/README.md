<h1>Packages</h1>

<h2>Package Structure</h2>
<pre>
packages
  |util-package
    |build //compiled from src
    |src //Typescript only. Put anything that we want to reuse inside src folder so that we can import them elsewhere in any codebase.
      |index.ts
    //Anything not within src folder will be used specifically for this codebase. Typescript files are not allowed.
    |more-samples
      |more.js
    |sample.js
    |package.json
    |tsconfig-package.json
    |tsconfig-package.tsbuildinfo
</pre>

<h2>Reference Generator</h2>
<ol>
    <li>Run <code>pnpm tsconfig:references</code> to generate path references.</li>
    <li>Then copy and paste into tsconfig's references property.</li>
    <li>Easier to do than trying to handle comments in tsconfig file, which is a json file.</li>
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