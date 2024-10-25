import Client from "./index.js";
import TestEvents from "../../backend/events/test-events.js";
import { EventConfig, MESSAGING_EVENTS } from "@dqiu/util-event";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 */

const client = new Client();
client.testConnectionToServer();

/**
 * @param {string} eventId 
 */
const listenToEventResponse = (eventId) => {
	client.listenToEventResponse(eventId, ({ responseType, message }) => {
		if (responseType === MESSAGING_EVENTS.SUCCESS) {
			console.log(`[Success] ${message}`);
		}
		if (responseType === MESSAGING_EVENTS.WARNING) {
			console.warn(`[Warning] ${message}`)
		}
		if (responseType === MESSAGING_EVENTS.ERROR) {
			console.error(`[Error] ${message}`)
		}
	});
};
if (EventConfig.eventTypes.ONE_AT_A_TIME.enabled) {
	/**
	 * @type {EventType}
	 */
	const eventId = 'ONE_AT_A_TIME';
	listenToEventResponse(eventId);
}
if (EventConfig.eventTypes.PARALLEL.enabled) {
	const parallelRoutes = TestEvents('server').getRoutes();
	const events = parallelRoutes.flatMap(r => r.eventBuilder.getEvents());
	for (const event of events) {
		listenToEventResponse(event.id);
	}
}