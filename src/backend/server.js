import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";

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
const io = new Server(server, {
	cors: {
		origin: frontendUrls[ServerUtil.NODE_ENV],
		methods: ["GET", "POST"]
	}
});

io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
	console.log("Client connected.");
	socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, () => {
		console.warn("[Warning] Client disconnected.");
	});
	socket.on(ROOM_EVENTS.ENTER_ROOM, (room) => {
		socket.join(room);
	});
	socket.on(ROOM_EVENTS.LEAVE_ROOM, (room) => {
		socket.leave(room);
	});
	if (process.env.SINGLE_EVENTS) {
		socket.on(process.env.SINGLE_EVENTS, (data, callback) => {
			if (socket.rooms.has(data.room)) {
				callback(data);
				io.emit(MESSAGING_EVENTS.SUCCESS, `Server: ${data.message}`);
			} else {
				io.emit(MESSAGING_EVENTS.ERROR, `Room '${data.room}' not found.`);
			}
		});
	}
	if (process.env.DYNAMIC_EVENTS) {
	}
});