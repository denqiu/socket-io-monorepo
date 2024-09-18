import { io } from "socket.io-client"
import { BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";

class Client {
	constructor() {
        this.socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);
    }

	connect() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
			// Note: Listening to custom events should be handled outside. Doing that here stacks the same listener every time client disconnects and reconnects or whenever nodemon reloads. In other words, the same message appears multiple times.
			if (process.env.SINGLE_EVENTS) {
				// this.socket.on(MESSAGING_EVENTS.SUCCESS, (response) => {
				// 	console.log(response);
				// });
				// this.socket.on(MESSAGING_EVENTS.ERROR, (error) => {
				// 	console.error(`[Error] ${error}`);
				// });
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route");
				this.socket.emit(process.env.SINGLE_EVENTS, { room: "route", message: "hi" }, (data) => console.log(`Client: ${data.message}`));
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route");
				this.socket.emit(process.env.SINGLE_EVENTS, { room: "route", message: "hi" }, (data) => console.log(data.message));
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2");
				this.socket.emit(process.env.SINGLE_EVENTS, { room: "route-2", message: "second route" }, (data) => console.log(`Client route 2: ${data.message}`));
			}
			if (process.env.DYNAMIC_EVENTS) {
			}
		});
	}

	loadSingleEvents(
		handleSuccess = (response) => {},
		handleError = (error) => {}
	) {
		// Fixes messages appearing multiple times.
		if (process.env.SINGLE_EVENTS) {
			socket.on(MESSAGING_EVENTS.SUCCESS, handleSuccess);
			socket.on(MESSAGING_EVENTS.ERROR, handleError);
			return true;
		}
		return false;
	}
}

export default Client;
const socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);
socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
	// Note: Listening to custom events should be handled outside. Doing that here stacks the same listener every time client disconnects and reconnects or whenever nodemon reloads. In other words, the same message appears multiple times.
	if (process.env.SINGLE_EVENTS) {
		// socket.on(MESSAGING_EVENTS.SUCCESS, (response) => {
		// 	console.log(response);
		// });
		// socket.on(MESSAGING_EVENTS.ERROR, (error) => {
		// 	console.error(`[Error] ${error}`);
		// });
		socket.emit(ROOM_EVENTS.ENTER_ROOM, "route");
		socket.emit(process.env.SINGLE_EVENTS, { room: "route", message: "hi" }, (data) => console.log(`Client: ${data.message}`));
		socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route");
		socket.emit(process.env.SINGLE_EVENTS, { room: "route", message: "hi" }, (data) => console.log(data.message));
		socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2");
		socket.emit(process.env.SINGLE_EVENTS, { room: "route-2", message: "second route" }, (data) => console.log(`Client route 2: ${data.message}`));
	}
	if (process.env.DYNAMIC_EVENTS) {
	}
});
// Fixes messages appearing multiple times.
if (process.env.SINGLE_EVENTS) {
	socket.on(MESSAGING_EVENTS.SUCCESS, (response) => {
		console.log(response);
	});
	socket.on(MESSAGING_EVENTS.ERROR, (error) => {
		console.error(`[Error] ${error}`);
	});
}