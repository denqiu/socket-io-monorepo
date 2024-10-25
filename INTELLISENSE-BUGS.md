<h1>Intellisense Bugs</h1>
<ul>
    <li>Outdated Package Import: If package compiled successfully but import statement is displaying an outdated version, push all local branches to git repo. Delete project. Then git clone. The following attempts didn't work:
        <ul>
            <li>Closing or restarting editor didn't work.</li>
            <li>Fiddling around with <code>clean, compile, install</code> commands and removing <code>node_modules</code> didn't work.</li>
            <li>Copying affected code to new files and deleting original files didn't work.</li>
        </ul>
    </li>
</ul>