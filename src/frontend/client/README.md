<h1>Client</h1>

<h2>Note About Package Imports</h2>
<ul>
    <li>pnpm workspace file is used to find nested <code>package.json</code>s and create nested <code>node_modules</code> which is included in <code>pnpm install</code>.</li>
    <li>Client is technically a package. It is listed in pnpm workspace file.</li>
    <li>Packages in <code>packages</code> folder are also listed in pnpm workspace file. But for consistency purposes, they should be installed first before importing.</li>
    <li>For separation of concerns, import Client as relative path. It should not be installed. Client is part of the frontend. It makes sense for frameworks to treat Client this way.</li>
</ul>