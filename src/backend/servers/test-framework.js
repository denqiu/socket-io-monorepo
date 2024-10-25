import ServerSetup from "../server-setup.js";
import TestEvents from "../events/test-events.js";

// develop UI guide to explain what's going on in monorepo, what are the important stuff,
const routes = TestEvents('framework').getRoutes();
const server = new ServerSetup('test', routes);
server.startFrameworkConnection();