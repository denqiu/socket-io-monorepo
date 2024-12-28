import { HowToExpandProps } from "./build/index.js";

/**
 * [code-review/comments, Comment Id: 01JENMFBCJHSZRN8HFJEHE1C7W]
 * @typedef {import("./build/index.js").SampleProps} SampleProps
 */

class Help {
	typeDerivations() {
		console.log("See https://stackoverflow.com/a/55132203");
	}
	howToInlineProps() {
		const inlinePropsInTypescript = new HowToExpandProps();
		inlinePropsInTypescript.wrongWay();
		/**
   * [code-review/comments, Comment Id: 01JENMFBCJ3WF1MPGKNNEEZ4E0]
		 * Inlining in JSDoc. This would be wrong in Typescript but Javascript has no generics so this is correct in Javascript.
		 * @type {{ [Props in keyof SampleProps]: SampleProps[Props] }}
		 * 
		 * @example
		 * const inlinePropsInJavascript; // Compiler error appears here. Hover over to see expected properties.
		 */
		const inlinePropsInJavascript = {
			id: "Id",
            label: "Label",
            items: [],
            func: (item) => {
                console.log(item);
            }
		};
		const viewPropDescriptions = inlinePropsInJavascript;
		inlinePropsInTypescript.betterWayButDuplicated(viewPropDescriptions);
		inlinePropsInTypescript.correctWayWithGenerics(viewPropDescriptions);
	}
}

console.log("Properties:", Object.getOwnPropertyNames(Help.prototype).filter(prop => prop !== 'constructor').map(prop => `\nHelp.${prop}`).join(""));

export default Help;