import { io } from "socket.io-client"
import { BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@util/event";

const socket = io(`http://localhost:4000`);
socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
	socket.on(MESSAGING_EVENTS.ERROR, (error) => {
		console.error(error);
	});
	
	socket.emit(ROOM_EVENTS.ENTER_ROOM, "route");
	socket.emit("EVENT_TEST", { room: "route", message: "hi" });
	socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route");
	socket.emit("EVENT_TEST", { room: "route", message: "hi" });
});
