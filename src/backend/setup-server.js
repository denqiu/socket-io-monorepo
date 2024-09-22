import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";
import TestParallelEvents from "./test-events/test-parallel-events.js";

const roomType = (type) => type === process.env.ONE_AT_A_TIME_EVENTS ? 1 : 2;

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
			console.log("Client connected.");
			socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, () => {
				console.warn("[Warning] Client disconnected.");
			});
			socket.on(ROOM_EVENTS.ENTER_ROOM, (room, type) => {
				socket.join(`${room}-${roomType(type)}`);
			});
			socket.on(ROOM_EVENTS.LEAVE_ROOM, (room, type) => {
				socket.leave(`${room}-${roomType(type)}`);
			});
			if (process.env.ONE_AT_A_TIME_EVENTS) {
				socket.on(process.env.ONE_AT_A_TIME_EVENTS, (data, callback) => {
					if (socket.rooms.has(`${data.room}-${roomType(process.env.ONE_AT_A_TIME_EVENTS)}`)) {
						callback(data);
						this.io.emit(MESSAGING_EVENTS.SUCCESS, `Server: ${data.message}`);
					} else {
						this.io.emit(MESSAGING_EVENTS.ERROR, `Room '${data.room}' not found.`);
					}
				});
			}
			if (process.env.PARALLEL_EVENTS) {
				for (const event of TestParallelEvents.events) {
					socket.on(event.id, (data) => {
						if (socket.rooms.has(`${data.room}-${roomType(process.env.PARALLEL_EVENTS)}`)) {
							event.callback(data, event.id, this.io);
                            this.io.emit(`${event.id}_${MESSAGING_EVENTS.SUCCESS}`, `Server: ${data.message}`);
						} else {
							this.io.emit(`${event.id}_${MESSAGING_EVENTS.ERROR}`, `Room '${data.room}' not found.`);
						}
                    });
				}
			}
		});
	}
}

export default SetupServer;