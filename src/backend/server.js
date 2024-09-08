import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@util/event";

const app = express();
app.use(cors());

const server = http.createServer(app);

const port = process.env.PORT || 4000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
});

io.on(BUILT_IN_IO_EVENTS.connect_io_to_socket, (socket) => {
	socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, () => {
		console.log("Client disconnected.");
	});
	socket.on(ROOM_EVENTS.ENTER_ROOM, (room) => {
		socket.join(room);
		console.log(`Rooms: ${socket.rooms}`);
	});
	socket.on(ROOM_EVENTS.LEAVE_ROOM, (room) => {
		socket.leave(room);
		console.log(`Rooms: ${socket.rooms}`);
	});
	socket.on("EVENT_TEST", (data) => {
		if (socket.rooms.has(data.room)) {
			console.log(`Test: ${data.message}`);
		} else {
			io.emit(MESSAGING_EVENTS.ERROR, "Please enter correct room");
		}
	})
});