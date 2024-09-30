import { isEnvVariableDisabled } from "@dqiu/util-event";
import { routeBuilder } from "./route-builder.js";
import TestEvents from "./events/test-events.js";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 */

// when all event builders are loaded for env variable disabled logic, then warn message.

// backend flatmap to ids, events
// routebuilder easy to get routes
// frontend granular control over how to display events

/**
 * @param {EventType} eventType 
 */
const warnEnv = (eventType) => console.warn(`[Warning] ${eventType} events have been created but are not allowed to load. Enable the env variable to remove this warning.`);
if (isEnvVariableDisabled.oneAtATime) {
	warnEnv('ONE_AT_A_TIME');
}
if (isEnvVariableDisabled.parallel) {
	warnEnv('PARALLEL');
}

export {
	TestEvents,
	routeBuilder,
};