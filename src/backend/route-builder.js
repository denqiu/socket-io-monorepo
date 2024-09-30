import { EventBuilder } from "@dqiu/util-event";

class RouteBuilder {	
	static hasError = false;

	constructor() {
        this.routes = [];
        this.trackRoutes = [];
	}

	/**
	 * @param {EventBuilder} eventBuilder 
	 * @param {string[]} route 
	 */
    add(eventBuilder, route) {
		try {
			const routeString = route.map(r => '/' + r).join('');
			if (this.trackRoutes.includes(routeString)) {
				RouteBuilder.hasError = true;
				throw new Error(`Route '${routeString}' cannot be associated with multiple event builders. Please re-configure.`);
			}
			this.trackRoutes.push(routeString);
			this.routes.push({ eventBuilder: eventBuilder, route: routeString });
		} catch (error) {
			console.error(error);
		}
    }

	/**
	 * @returns {{ eventBuilder: EventBuilder, route: string }[]}
	 */
	getRoutes() {
		return this.routes;    
    }

	static getHasError() {
		return RouteBuilder.hasError;
	}
}

const routeTestsBuilder = new RouteBuilder();
const routeBuilder = new RouteBuilder();

export {
	routeTestsBuilder,
    routeBuilder
};