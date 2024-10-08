import { EventBuilder, EventType, EventEnvConfig } from "@dqiu/util-event";

type RouteProps = {
    eventBuilder: EventBuilder,
    route: string
};

let trackRoutes: string[];

class RouteBuilder {	
    routes: { [Props in keyof RouteProps]: RouteProps[Props] }[];

	constructor() {
        this.routes = [];
        trackRoutes = [];
	}

	/**
	 * Add route and associated event builder. If route already exists, log error stack trace, which should help identify line number where error occurred.
	 */
    add(eventBuilder: EventBuilder, route: string[]){
		try {
			const routeString = route.map(r => '/' + r).join('');
			if (trackRoutes.includes(routeString)) {
				throw new Error(`Route '${routeString}' cannot be associated with multiple event builders. Please re-configure.`);
			}
			trackRoutes.push(routeString);
			this.routes.push({ eventBuilder: eventBuilder, route: routeString });
		} catch (error) {
			console.error(error);
		}
    }

	/**
	 * Setup warning after all routes and associated event builders have been added.
	 */
	setupEnvWarning() {
		for (const eventType of EventEnvConfig.listEventTypes()) {
			if (EventEnvConfig.isEventTypeDisabled(eventType)) {
				console.warn(`[Warning] ${eventType} events have been created but are not allowed to load. Enable the env variable to remove this warning.`);
			}
		}
	}
}

// Ensures the same route builder is used when building routes across multiple files.
const routeTestsBuilder = new RouteBuilder();
const routeBuilder = new RouteBuilder();

export {
    type RouteProps,
    routeTestsBuilder,
    routeBuilder
};