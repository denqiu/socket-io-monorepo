import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { EventResponder, EventHelper, BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";
import { TestEvents } from "./index.js";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 */

/**
 * @param {EventType} type 
 */
const roomType = (type) => type === 'ONE_AT_A_TIME' ? 1 : 2;

const initConnection = (socket) => {
	console.log("[Server] Client connected.");
	socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, () => {
		console.warn("[Warning] Client disconnected.");
	});
	socket.on(ROOM_EVENTS.ENTER_ROOM, (room, type) => {
		socket.join(`${room}-${roomType(type)}`);
	});
	socket.on(ROOM_EVENTS.LEAVE_ROOM, (room, type) => {
		socket.leave(`${room}-${roomType(type)}`);
	});
};

class SetupServer {
	constructor() {
		const app = express();
		app.use(cors());

		const server = http.createServer(app);

		server.listen(ServerUtil.backendPort, () => {
			console.log(`Server is running on port ${ServerUtil.backendPort}.`);
		});

		const frontendUrls = {
			development: ["http://localhost:5173", "http://localhost:4173"], // vite dev and preview ports
			production: ["https://your-production-url.com"] // replace with your production domain
		};
		this.io = new Server(server, {
			cors: {
				origin: frontendUrls[ServerUtil.NODE_ENV],
				methods: ["GET", "POST"]
			}
		});
    }

	testConnection() {
		this.io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
			initConnection(socket);
			if (EventHelper.eventTypes.ONE_AT_A_TIME.enabled) {
				// This is a demonstration of passing information back and forth between server and client.
				// There's no problem setting up callback client-side but there are limitations. We cannot pass io to callback.
				// Callback is setup server-side for parallel events. We can pass io to callback.
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
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `Server: ${error}` });
						}
					} else {
						eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `Room '${data.room}' not found.` });
					}
				});
			}
			if (EventHelper.eventTypes.PARALLEL.enabled) {
				const testParallelEvents = TestEvents('server').getRoutes().flatMap(r => r.eventBuilder.getEvents());
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

	testFrameworkConnection() {
		this.io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
			initConnection(socket);
			const events = TestEvents('framework').getRoutes().flatMap(r => r.eventBuilder.getEvents());
			for (const event of events) {
				// No need for ONE_AT_A_TIME or PARALLEL conditional check here. It's already handled in event builder.
				// Event builder will not add events with their type not enabled.
				const eventResponder = new EventResponder(event.id, this.io);
				socket.on(event.id, (data) => {
					if (socket.rooms.has(`${data.room}-${roomType(event.type)}`)) {
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
		});
	}
}

export default SetupServer;
export { roomType };