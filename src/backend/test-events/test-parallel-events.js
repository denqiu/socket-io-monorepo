import { EventBuilder } from "@dqiu/util-event";

const eventBuilder = new EventBuilder();
eventBuilder.addEvent({
	id: "PARALLEL_1",
	label: "Parallel Event 1",
	callback: (data, eventId, io) => console.log(`${eventId} - Client: ${data.message}`)
});
eventBuilder.addEvent({
	id: "PARALLEL_2",
	label: "Parallel Event 2",
	callback: (data, eventId, io) => console.log(`${eventId} - Client route 2: ${data.message}`)
});

export default {
	label: "Test Parallel Events",
	events: eventBuilder.getEvents(),
	eventIds: eventBuilder.getEventIds(),
};