import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { EventResponder, EventConfig, BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import { ROUTE_EVENTS } from "@dqiu/util-route";
import ServerUtil from "@dqiu/util-server";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 * @typedef {import("@dqiu/util-route").RouteProps} RouteProps
 */

/**
 * @param {EventType} type 
 */
const roomType = (type) => type === 'ONE_AT_A_TIME' ? 1 : 2;

/**
 * Development environment notes:
 * 1. Responds right away on server-client test when client disconnects (Ctrl+C client terminal).
 * 2. Delayed response on server-framework test when client disconnects (Ctrl+C client terminal). Shows up on browser refresh. Client terminal (in local environment) starts up vite server that runs framework. In short, project server listens to vite server and vite server listens to browser, thus creating delayed response. In Production environment, framework is compiled into static files thus project server listens to browser. No intermediary involved. Response should be immediate.
 */
const initConnection = (socket) => {
	console.log("Server: Client connected.");
	socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, (reason) => {
		console.warn(`[Warning] Server: Client disconnected due to '${reason}'`);
	});
	socket.on(ROOM_EVENTS.ENTER_ROOM, (room, type) => {
		socket.join(`${room}-${roomType(type)}`);
	});
	socket.on(ROOM_EVENTS.LEAVE_ROOM, (room, type) => {
		socket.leave(`${room}-${roomType(type)}`);
	});
};

class ServerSetup {
	/**
	 * @param {'test' | 'app'} mode If mode is 'test' log backend port otherwise hide backend port. This is fine in local development but I believe backend port shouldn't be needlessly exposed in production for security reasons. 
	 * @param {RouteProps[]} routes
	 */
	constructor(mode, routes) {
		this.mode = mode;
		this.routes = routes;

		const app = express();
		app.use(cors());

		const server = http.createServer(app);

		server.listen(ServerUtil.backendPort, () => {
			if (this.mode === 'test') {
				console.log(`Server is running on port ${ServerUtil.backendPort}.`);
			}
		});

		const frontendUrls = {
			development: ["http://localhost:5173", "http://localhost:4173"], // vite dev and preview ports
			production: ["https://your-production-url.com"] // replace with your production domain
		};
		this.io = new Server(server, {
			cors: {
				origin: frontendUrls[ServerUtil.NODE_ENV],
				methods: ["GET", "POST"]
			},
		});
    }

	/**
	 * Starts connection between server and client. No framework. Routes are hardcoded on client-side. 
	 * 
	 * Notes:
	 * 1. This is a demonstration of passing information back and forth between server and client.
	 * 2. There's no problem setting up callback client-side but there are limitations. We cannot pass io to callback.
	 * 3. Callback is setup server-side for parallel events. We can pass io to callback.
	 */
	startConnection() {
		this.io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
			initConnection(socket);
			if (EventConfig.eventTypes.ONE_AT_A_TIME.enabled) {
				/**
				 * @type {EventType}
				 */
				const eventType = 'ONE_AT_A_TIME';
				const eventResponder = new EventResponder(eventType, this.io);
				socket.on(eventType, (data, callback) => {
					if (socket.rooms.has(`${data.room}-${roomType(eventType)}`)) {
						try {
							if (data.serverTest) {
								data.showIoError ? callback(data, this.io) : callback(data);
							} else {
								callback(data, eventResponder);
							}
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `Server: ${data.message}` });
						} catch (error) {
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `Server: ${error.message}` });
						}
					} else {
						eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `Room '${data.room}' not found.` });
					}
				});
			}
			if (EventConfig.eventTypes.PARALLEL.enabled) {
				const testParallelEvents = this.routes.flatMap(r => r.eventBuilder.getEvents());
				for (const event of testParallelEvents) {
					const eventResponder = new EventResponder(event.id, this.io);
					socket.on(event.id, (data) => {
						if (socket.rooms.has(`${data.room}-${roomType('PARALLEL')}`)) {
							try {
								event.callback(data, eventResponder);
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${event.id} - Server: ${data.message}` });
							} catch (error) {
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - ${error.message}` });
							}
						} else {
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - Room '${data.room}' not found.` });
						}
                    });
				}
			}
		});
	}

	/**
	 * Starts connection between server and framework. Server send routes to framework.
	 * 
	 * If mode is 'test', test framework behaviors with minimal routes and events and with error handling. Otherwise, start up app without error handling. Let each event handle its own errors.
	 */
	startFrameworkConnection() {
		this.io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
			initConnection(socket);
			// On every connection to server, immediately load route listener, which waits for client to connect and send event before responding back with routes. Routes are sent on demand. 
			socket.on(ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER, () => {
				this.io.emit(`${ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER}_RESPONSE`, this.routes.map(r => {
					return {
						route: r.route,
						events: r.eventBuilder.getEvents().map(event => ({ id: event.id, label: event.label, description: event.description }))
					};
				}));
			});
			// On every connection to server, immediately load event listeners. Events are run on demand every time socket receives event's id.
			const events = this.routes.flatMap(r => r.eventBuilder.getEvents());
			for (const event of events) {
				const eventResponder = new EventResponder(event.id, this.io);
				socket.on(event.id, (data) => {
					if (socket.rooms.has(`${data.room}-${roomType(event.getType())}`)) {
						if (this.mode === 'app') {
							event.callback(data, eventResponder);
						}
						if (this.mode === 'test') {
							try {
								event.callback(data, eventResponder);
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${event.id} - Server: ${data.message}` });
							} catch (error) {
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - ${error.message}` });
							}
						}
					} else {
						eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - Room '${data.room}' not found.` });
					}
				});
			}
		});
	}
}

export default ServerSetup;