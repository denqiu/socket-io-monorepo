import Client from "./index.js";
import { TestEvents } from "../../backend/index.js";
import { MESSAGING_EVENTS } from "@dqiu/util-event";

const eventIds = TestEvents('server').routes.flatMap(r => r.eventBuilder.eventIds);
const client = new Client(eventIds, {
	[MESSAGING_EVENTS.SUCCESS]: (response) => console.log(`[Success] ${response}`),
	[MESSAGING_EVENTS.WARNING]: (warning) => console.warn(`[Warning] ${warning}`),
    [MESSAGING_EVENTS.ERROR]: (error) => console.error(`[Error] ${error}`)
});
client.listenToEventResponses();
client.testConnectionToServer();