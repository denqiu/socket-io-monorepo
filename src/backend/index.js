import { routeBuilder } from "@dqiu/util-route";
import TestEvents, { sampleTest } from "./events/test-events.js";

routeBuilder.setupEnvWarning();
export {
	TestEvents,
	sampleTest,
	routeBuilder,
};