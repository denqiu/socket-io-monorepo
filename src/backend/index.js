import { routeBuilder } from "@dqiu/util-route";
import TestEvents from "./events/test-events.js";

routeBuilder.warnEventTypes();
export {
	TestEvents,
	routeBuilder,
};