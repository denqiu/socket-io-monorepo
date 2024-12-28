import { testRouteBuilder } from "@dqiu/util-route";
import { EventBuilder, EventResponder, MESSAGING_EVENTS } from "@dqiu/util-event";
import { DateTime } from "luxon";

/**
 * @typedef {import("@dqiu/util-event").EventDisplayType} EventDisplayType
 * @typedef {import("luxon").DurationUnit} DurationUnit
 */

/**
 * Countdown timer for ONE_AT_A_TIME event.
 * @param {number} duration
 * @param {DurationUnit} durationUnit
 * @param {EventResponder} eventResponder 
 */
function createCountdownTimer(duration, durationUnit, eventResponder) {
	const end = DateTime.now().plus({ [durationUnit]: duration });
	const showCountdown = () => {
		const countdown = end.diffNow();
		if (countdown.as('milliseconds') <= 0) {
			eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: "Countdown complete!" });
			clearInterval(timer);
			return;
		}
		eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `Countdown: ${countdown.as(durationUnit)} ${durationUnit}` });
	};
	const timer = setInterval(showCountdown, 1000);
	showCountdown();
}

/**
 * UI will display event's label and description. For testing purposes, event's id appears in UI. Otherwise, id is not allowed to appear.
 * @param {EventDisplayType} displayType If 'SERVER' return test routes with only parallel events. If 'FRAMEWORK' return test routes with both one at a time and parallel events.
 */
function TestEvents(displayType) {
	if (displayType === 'SERVER') {
		// Keep as is. We create parallel events here. One at a time events are already created in the client.
	}
	// If framework, one at a time events are moved from client to server.
	const routeEvents = new EventBuilder();
	if (displayType === 'FRAMEWORK') {
		routeEvents.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
			description: "[Framework Test] A parallel event that tests warning messages using the same id in different routes. Expected behavior is that warning messages would appear independently of each other because they are separated by routes, even though they share the same id.",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.WARNING, message: "First Route: First warning" });
			}
		});
		routeEvents.add('ONE_AT_A_TIME', {
			label: 'Wait 15 seconds',
			description: "[Framework Test] A countdown timer that demonstrates how ONE_AT_A_TIME events behave. Expected behavior is that ONE_AT_A_TIME events across all routes would be disabled until the countdown timer completes.",
			callback: (data, responder) => createCountdownTimer(15, 'seconds', responder)
		});
		routeEvents.add('ONE_AT_A_TIME', {
			label: "Event 1",
			description: "[Framework Test] ONE_AT_A_TIME version of parallel event 'PARALLEL_1'. If countdown timer event is running, this event must wait for countdown timer to complete before it can run. ONE_AT_A_TIME event moved from client to server that simply logs a message from data.",
			callback: (data, responder) => console.log(`Event: ${data.message}`)
		});
	}
	routeEvents.add('PARALLEL', {
		id: "PARALLEL_1",
		label: "Parallel Event 1",
		description: "[Server Test] Not affected by countdown timer event. Parallel event that logs a message from data with event's id.",
		callback: (data, responder) => console.log(`${responder.getEventId()} - Event: ${data.message}`)
	});

	const route2Events = new EventBuilder();
	if (displayType === 'FRAMEWORK') {
		route2Events.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
			description: "[Framework Test] A parallel event that tests warning messages using the same id in different routes. Expected behavior is that warning messages would appear independently of each other because they are separated by routes, even though they share the same id.",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.WARNING, message: "Second Route: Second warning" });
			}
		});
		route2Events.add('ONE_AT_A_TIME', {
			label: 'Wait 10 seconds',
			description: "[Framework Test] A countdown timer that demonstrates how ONE_AT_A_TIME events behave. Expected behavior is that ONE_AT_A_TIME events across all routes would be disabled until the countdown timer completes.",
			callback: (data, responder) => createCountdownTimer(10, 'seconds', responder)
		});
		route2Events.add('ONE_AT_A_TIME', {
			label: "Event route 2",
			description: "[Framework Test] ONE_AT_A_TIME version of parallel event 'PARALLEL_2'. If countdown timer event is running, this event must wait for countdown timer to complete before it can run. ONE_AT_A_TIME event moved from client to server that logs a message from data and uses server IO to send a message to client.",
			callback: (data, responder) => {
				console.log(`Event: ${data.message}`);
				responder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `Event emitting IO: io ${data.message}` });
			}
		});
	}
	route2Events.add('PARALLEL', {
		id: "PARALLEL_2",
		label: "Parallel Event route 2",
		description: "[Server Test] Not affected by countdown timer event. Parallel event that logs a message from data and uses server IO to send a message to client with event's id.",
		callback: (data, responder) => {
			console.log(`${responder.getEventId()} - Event: ${data.message}`);
			responder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${responder.getEventId()} - Emitting IO: io ${data.message}` });
		}
	});

	const routeErrorEvents = new EventBuilder();
	if (displayType === 'FRAMEWORK') {
		routeErrorEvents.add('PARALLEL', {
			id: "SAME_ID_DIFFERENT_WARNING",
			label: "Same ID, different warning",
			description: "[Framework Test] A parallel event that tests warning messages using the same id in different routes. Expected behavior is that warning messages would appear independently of each other because they are separated by routes, even though they share the same id.",
            callback: (data, responder) => {
				responder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: "Error Route: Third warning" });
			}
		});
		routeErrorEvents.add('ONE_AT_A_TIME', {
			label: 'Wait 30 seconds',
			description: "[Framework Test] A countdown timer that demonstrates how ONE_AT_A_TIME events behave. Expected behavior is that ONE_AT_A_TIME events across all routes would be disabled until the countdown timer completes.",
			callback: (data, responder) => createCountdownTimer(30, 'seconds', responder)
		});
		routeErrorEvents.add('ONE_AT_A_TIME', {
			label: "Error Event",
			description: "[Framework Test] ONE_AT_A_TIME version of parallel event 'PARALLEL_ERROR'. If countdown timer event is running, this event must wait for countdown timer to complete before it can run. ONE_AT_A_TIME event moved from client to server that simply throws and catches an error to test error handling. For testing purposes the server handles errors. In actual applications, each event will handle its own errors.",
			callback: (data, responder) => {
				throw new Error("Threw error");
			}
		});
	}
	routeErrorEvents.add('PARALLEL', {
		id: "PARALLEL_ERROR",
		label: "Parallel Event Error",
		description: "[Server Test] Not affected by countdown timer event. Parallel event that simply throws and catches an error to test error handling. For testing purposes the server handles errors. In actual applications, each event will handle its own errors.",
		callback: (data, responder) => {
			throw new Error(`Threw parallel error`);
		}
	});

	testRouteBuilder.addIfAbsent(routeEvents, ['route']);
	testRouteBuilder.addIfAbsent(route2Events, ['route-2']);
	testRouteBuilder.addIfAbsent(routeErrorEvents, ['route-error']);
	testRouteBuilder.warnEventTypes();
	return testRouteBuilder;
}

export default TestEvents;