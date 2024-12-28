import ServerSetup from "../server-setup.js";
import TestEvents from "../events/test-events.js";

const routes = TestEvents('SERVER').getRoutes();
const server = new ServerSetup('test', routes);
server.startConnection();