import Client from "./index.js";
import { TestEvents } from "../../backend/index.js";

const client = new Client();
client.testConnectionToServer();

const handleSuccess = (response) => console.log(response);
const handleError = (error) => console.error(`[Error] ${error}`);
client.loadOneAtATimeEvents(handleSuccess, handleError);
client.loadParallelEvents(handleSuccess, handleError, TestEvents('server').getRoutes().flatMap(r => r.eventBuilder.getEventIds()));