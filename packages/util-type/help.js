import { HowToExpandProps } from "./build/index.js";

/**
 * @typedef {import("./build/index.js").SampleProps} SampleProps
 */

class Help {
	typeDerivations() {
		console.log("See https://stackoverflow.com/a/55132203");
	}
	howToInlineProps() {
		const inlineProps = new HowToExpandProps();
		inlineProps.wrongWay();
		inlineProps.correctWay();
		/**
		 * Inlining in JSDoc.
		 * @type {{ [Props in keyof SampleProps]: SampleProps[Props] }}
		 */
		const viewPropDescriptions = {
			id: "Id",
			label: "Label",
			items: [],
			func: (item) => {
				console.log(item);
			}
		};
		inlineProps.correctWay(viewPropDescriptions);
	}
}

console.log("Properties:", Object.getOwnPropertyNames(Help.prototype).filter(prop => prop !== 'constructor').map(prop => `\nHelp.${prop}`).join(""));

export default Help;