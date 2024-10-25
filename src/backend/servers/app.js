import ServerSetup from "../server-setup.js";
import { routeBuilder } from "@dqiu/util-route";

routeBuilder.warnEventTypes();
const server = new ServerSetup('app', routeBuilder.getRoutes());
server.startFrameworkConnection();