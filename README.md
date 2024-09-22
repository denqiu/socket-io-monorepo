<h1>Socket.io Monorepo</h1>
<ul>
    <li>Node version: 20.15.1</li>
    <li>Pnpm version: 9.5.0</li>
    <li>Monorepo with templated frontends using socket.io events.</li>
    <li>Nodemon installation: <code>pnpm install nodemon --global</code></li>
    <li><a href="https://medium.com/@tony.infisical/stop-using-dotenv-in-node-js-v20-6-0-8febf98f6314">Stop using Dotenv v20.6.0+</a>: <code>nodemon --env-file=.env index.js</code>. Then in main <code>package.json</code> create hard links to <code>.env</code> file. Changes to any <code>.env</code> file will be reflected immediately in the other <code>.env</code> files.</li>
    <li>How to run multiple scripts in parallel: <code>pnpm install concurrently --global</code></li>
    <li>There's an issue where nodemon fails to reload after making multiple changes when running multiple scripts in parallel, via <code>npm-run-all --parallel</code> or <code>concurrently --raw</code>. Simply using <code>concurrently</code> without <code>--raw</code> argument resolves the issue.</li>
</ul>