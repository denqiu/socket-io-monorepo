import { EventBuilder, EventConfig, FrameworkSideEvent } from "@dqiu/util-event";

type FrameworkSideRoutes = {
	route: string;
	events: FrameworkSideEvent[];
};

type RouteProps = {
	route: string;
	eventBuilder: EventBuilder;
};

/**
 * [code-review/comments, Comment Id: 01JEMYRZNTXE1CR3KWXENN0QXA]
 * Route tracker at project level.
 */
let trackRoutes: string[];

class RouteBuilder {	
    private routes: { [Props in keyof RouteProps]: RouteProps[Props] }[];

	constructor() {
        this.routes = [];
        trackRoutes = [];
	}

	/**
  * [code-review/comments, Comment Id: 01JEMYRZNTH4E6ZVA2YCMNZGGS]
	 * 1. Add route and associated event builder if route doesn't exist.
	 * 2. Skip route if it already exists.
	 */
    addIfAbsent(eventBuilder: EventBuilder, route: string[]){
		const routeString = route.map(r => '/' + r).join('');
		if (trackRoutes.includes(routeString)) {
			return;
		}
		trackRoutes.push(routeString);
		this.routes.push({ eventBuilder: eventBuilder, route: routeString });
    }

	getRoutes() {
		return this.routes;
	}

	/**
  * [code-review/comments, Comment Id: 01JEMYRZNV1RN79ENBZ8F2JDKC]
	 * Setup warning after all routes and associated event builders have been added.
	 */
	warnEventTypes() {
		for (const eventType of EventConfig.listEventTypes()) {
			if (!EventConfig.eventTypes[eventType].enabled) {
				console.warn(`[Warning] ${eventType} events have been created but are not allowed to load. Enable the event type to remove this warning.`);
			}
		}
	}
}

//[code-review/comments, Comment Id: 01JEMYRZNVGERFVTJS3QG71G1T] Ensures the same route builder is used when building routes across multiple files.
const testRouteBuilder = new RouteBuilder();
const routeBuilder = new RouteBuilder();

export {
    type FrameworkSideRoutes,
	type RouteProps,
    testRouteBuilder,
    routeBuilder
};