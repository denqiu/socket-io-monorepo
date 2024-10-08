import { routeTestsBuilder } from "@dqiu/util-route";
import { EventBuilder, EventResponder, MESSAGING_EVENTS } from "@dqiu/util-event";
import { DateTime } from "luxon";

/**
 * @typedef {import("luxon").DurationUnits} DurationUnits
 */

/**
 * Countdown timer for one-at-a-time event type.
 * @param {number} duration 
 * @param {DurationUnits} durationUnits
 * @param {EventResponder} eventResponder 
 */
function createCountdownTimer(duration, durationUnits, eventResponder) {
	const end = DateTime.now().plus({ [durationUnits]: duration });
	const showCountdown = () => {
		const countdown = end.diffNow();
		if (countdown.as('milliseconds') <= 0) {
			eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: "Countdown complete!" });
			clearInterval(timer);
			return;
		}
		eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `Countdown: ${countdown.as(durationUnits)} ${durationUnits}` });
	};
	const timer = setInterval(showCountdown, 1000);
	showCountdown();
}

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
		routeEvents.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.WARNING, message: "First Route: First warning" });
			}
		});
		route2Events.add('ONE_AT_A_TIME', {
			label: 'Wait 15 seconds',
			callback: (data, responder) => createCountdownTimer(15, 'seconds', responder)
		});
		routeEvents.add('ONE_AT_A_TIME', {
			label: "Event 1",
			callback: (data, responder) => console.log(`Event: ${data.message}`)
		});
	}
	routeEvents.add('PARALLEL', {
		id: "PARALLEL_1",
		label: "Parallel Event 1",
		callback: (data, responder) => console.log(`${responder.eventId} - Event: ${data.message}`)
	});

	const route2Events = new EventBuilder();
	if (testType === 'framework') {
		route2Events.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.WARNING, message: "Second Route: Second warning" });
			}
		});
		route2Events.add('ONE_AT_A_TIME', {
			label: 'Wait 10 seconds',
			callback: (data, responder) => createCountdownTimer(10, 'seconds', responder)
		});
		route2Events.add('ONE_AT_A_TIME', {
			label: "Event route 2",
			callback: (data, responder) => {
				console.log(`Event: ${data.message}`);
				responder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `Event emitting IO: io ${data.message}` });
			}
		});
	}
	route2Events.add('PARALLEL', {
		id: "PARALLEL_2",
		label: "Parallel Event route 2",
		callback: (data, responder) => {
			console.log(`${responder.eventId} - Event: ${data.message}`);
			responder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${responder.eventId} - Emitting IO: io ${data.message}` });
		},
		callbackTest: (data, io, eventId) => {
			console.log("Emitting io");
			io.emit("ONE_AT_A_TIME_RESPONSE", { responseType: MESSAGING_EVENTS.SUCCESS, message: `${eventId} Emitting IO: io ${data.message}`});
			io.emit(`${eventId}_RESPONSE`, { responseType: MESSAGING_EVENTS.SUCCESS, message: `${eventId} Emitting IO: io ${data.message}` });
		}
	});

	const routeErrorEvents = new EventBuilder();
	if (testType === 'framework') {
		routeErrorEvents.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: "Error Route: Third warning" });
			}
		});
		routeErrorEvents.add('ONE_AT_A_TIME', {
			label: 'Wait 30 seconds',
			callback: (data, responder) => createCountdownTimer(30, 'seconds', responder)
		});
		routeErrorEvents.add('ONE_AT_A_TIME', {
			label: "Error Event",
			callback: (data, responder) => {
				throw new Error("Threw error");
			}
		});
	}
	routeErrorEvents.add('PARALLEL', {
		id: "PARALLEL_ERROR",
		label: "Parallel Event Error",
		callback: (data, responder) => {
			// throw new Error(`${responder.eventId} - Threw parallel error`);
		}
	});
	routeTestsBuilder.add(routeEvents, ['route']);
	routeTestsBuilder.add(route2Events, ['route-2']);
	routeTestsBuilder.add(routeErrorEvents, ['route-error']);
	routeTestsBuilder.setupEnvWarning();
	return routeTestsBuilder;
}

function sampleTest(data, io, sampleResponder) {
	io.emit("SAMPLE_EVENT_RESPONSE", { responseType: MESSAGING_EVENTS.WARNING, message: `Response: ${data.message}`});
	sampleResponder.emitToClient({ responseType: MESSAGING_EVENTS.WARNING, message: `Event Responder: ${data.message}` });
}

export default TestEvents;
export { 
	sampleTest
};