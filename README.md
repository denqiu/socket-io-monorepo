<h1>Socket.io Monorepo</h1>
<ul>
    <li>Node version: 20.15.1</li>
    <li>Pnpm version: 9.5.0</li>
    <li>Monorepo with templated frontends using socket.io events.</li>
</ul>
<div>
Steps:<br>
    <ol>
        <li>Create Typescript linter: <code>npx gts init</code>. Remove <code>index.ts</code>. In <code>package.json</code> replace npm with pnpm and change compile script to <code>tsc --build</code>.</li>
        <li>Update generated <code>tsconfig.json</code> to match this repo's <code>tsconfig.json</code> to configure Typescript library declarations for packages. References should be associated with each package's tsconfig file.</li>
    </ol>
</div>