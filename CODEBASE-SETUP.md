<h1>Codebase Setup</h1>

<ol>
    <li>Codebase in general should be implemented in Javascript, i.e., backend, client frontend, frameworks.</li>
    <li>Any custom code that we want to import, implement in Typescript, i.e., packages, framework components.</li>
    <li>Then use JSDoc to import Typescript code.</li>
    <li>See table on how to import types. For more information, see <a href="https://devhints.io/jsdoc">Jsdoc cheatsheet</a>.
        <table>
            <tr>
                <th>JSDoc Types</th>
                <th>Autocomplete Support</th>
                <th>My Recommendations</th>
                <th>Reason</th>
            </tr>
            <tr>
                <td>@typedef {import('./Foo.js').CustomType} CustomType</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Has autocomplete support.</td>
            </tr>
            <tr>
                <td>@import { CustomType } from "./Foo.js"</td>
                <td>No</td>
                <td>No</td>
                <td>No autocomplete support.</td>
            </tr>
            <tr>
                <td>@type {number}</td>
                <td>Not Applicable</td>
                <td>Yes</td>
                <td>Consistent.</td>
            </tr>
            <tr>
                <td>@const {number}</td>
                <td>Not Applicable</td>
                <td>No</td>
                <td>Redundant.</td>
            </tr>
        </table>
    </li>
</ol>