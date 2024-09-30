import { routeTestsBuilder } from "../route-builder.js";
import { EventBuilder, MESSAGING_EVENTS } from "@dqiu/util-event";

/**
 * @param {'server' | 'framework'} testType
 * @returns If 'server' return test routes with only parallel events. If 'framework' return test routes with both one at a time and parallel events.
 */
function TestEvents(testType) {
	if (testType === "server") {
		// Keep as is. We create parallel events here. One at a time events are already created in the client.
	}
	// If framework, one at a time events are moved from client to server.
	const routeEvents = new EventBuilder();
	if (testType === 'framework') {
		routeEvents.add('ONE_AT_A_TIME', {
			label: "Event 1",
			callback: (data, io) => console.log(`Event: ${data.message}`)
		});
	}
	routeEvents.add('PARALLEL', {
		id: "PARALLEL_1",
		label: "Parallel Event 1",
		callback: (data, eventId, io) => console.log(`${eventId} - Event: ${data.message}`)
	});

	const route2Events = new EventBuilder();
	if (testType === 'framework') {
		route2Events.add('ONE_AT_A_TIME', {
			label: "Event route 2",
			callback: (data, io) => {
				console.log(`Event: ${data.message}`);
				io.emit(MESSAGING_EVENTS.SUCCESS, `Event emitting IO: io ${data.message}`);
			}
		});
	}
	route2Events.add('PARALLEL', {
		id: "PARALLEL_2",
		label: "Parallel Event route 2",
		callback: (data, eventId, io) => {
			console.log(`${eventId} - Event: ${data.message}`);
			io.emit(`${eventId}_${MESSAGING_EVENTS.SUCCESS}`, `${eventId} - Emitting IO: io ${data.message}`);
		}
	});

	const routeErrorEvents = new EventBuilder();
	if (testType === 'framework') {
		routeErrorEvents.add('ONE_AT_A_TIME', {
			label: "Error Event",
			callback: (data, io) => {
				throw new Error("Threw error");
			}
		});
	}
	routeErrorEvents.add('PARALLEL', {
		id: "PARALLEL_ERROR",
		label: "Parallel Event Error",
		callback: (data, eventId, io) => {
			throw new Error(`${eventId} - Threw parallel error`);
		}
	});
	
	routeTestsBuilder.add(routeEvents, ['route']);
	routeTestsBuilder.add(route2Events, ['route-2']);
	routeTestsBuilder.add(routeErrorEvents, ['route-error']);

	return routeTestsBuilder;
}

export default TestEvents;