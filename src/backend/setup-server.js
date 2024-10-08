import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { EventResponder, BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";
import { TestEvents, sampleTest } from "./index.js";

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
			development: ["http://localhost:5173", "http://localhost:4173"],
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
			if (process.env.ONE_AT_A_TIME_EVENTS) {
				// Although callback is created in the client, there's no harm in setting up callback in events folder, as demonstrated for parallel events.
				// This is a demonstration of the options we have at our disposal to setup event logic.
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
			if (process.env.PARALLEL_EVENTS) {
				const testParallelEvents = TestEvents('server').routes.flatMap(r => r.eventBuilder.events);
				for (const event of testParallelEvents) {
					const eventResponder = new EventResponder(event.id, this.io);
					socket.on(event.id, (data) => {
						if (socket.rooms.has(`${data.room}-${roomType('PARALLEL')}`)) {
							try {
								event.callback(data, eventResponder);
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${event.id} - Server: ${data.message}` });
							} catch (error) {
								eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - ${error}` });
							}
							event.callbackTest && event.callbackTest(data, this.io, event.id);
						} else {
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - Room '${data.room}' not found.` });
						}
                    });
				}
				const sampleResponder = new EventResponder("SAMPLE_EVENT", this.io);
				socket.on("SAMPLE_EVENT", (data) => sampleTest(data, this.io, sampleResponder));
			}
		});
	}

	testFrameworkConnection() {
		this.io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
			initConnection(socket);
			const events = TestEvents('framework').routes.flatMap(r => r.eventBuilder.events);
			for (const event of events) {
				const eventResponder = new EventResponder(event.id, this.io);
				// figure out event type from event
				socket.on(event.id, (data) => {
					if (socket.rooms.has(`${data.room}-${roomType('PARALLEL')}`)) {
						try {
							event.callback(data, eventResponder);
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.SUCCESS, message: `${event.id} - Server: ${data.message}` });
						} catch (error) {
							eventResponder.emitToClient({ responseType: MESSAGING_EVENTS.ERROR, message: `${event.id} - ${error}` });
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