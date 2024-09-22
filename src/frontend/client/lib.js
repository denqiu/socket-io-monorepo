import { io } from "socket.io-client"
import { BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";
import "@dqiu/backend-server";

class Client {
	constructor() {
        this.socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);
    }

	testConnection() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
			// Note: Listening to custom events should be handled outside. Doing that here stacks the same listener every time client disconnects and reconnects or whenever nodemon reloads. In other words, the same message appears multiple times.
			if (process.env.ONE_AT_A_TIME_EVENTS) {
				// this.socket.on(MESSAGING_EVENTS.SUCCESS, (response) => {
				// 	console.log(response);
				// });
				// this.socket.on(MESSAGING_EVENTS.ERROR, (error) => {
				// 	console.error(`[Error] ${error}`);
				// });
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route", process.env.ONE_AT_A_TIME_EVENTS);
				this.socket.emit(process.env.ONE_AT_A_TIME_EVENTS, { room: "route", message: "hi" }, (data) => console.log(`Client: ${data.message}`));
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route", process.env.ONE_AT_A_TIME_EVENTS);
				this.socket.emit(process.env.ONE_AT_A_TIME_EVENTS, { room: "route", message: "hi" }, (data) => console.log(data.message));
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2", process.env.ONE_AT_A_TIME_EVENTS);
				this.socket.emit(process.env.ONE_AT_A_TIME_EVENTS, { room: "route-2", message: "second route" }, (data) => console.log(`Client route 2: ${data.message}`));
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-2", process.env.ONE_AT_A_TIME_EVENTS);
			}
			if (process.env.PARALLEL_EVENTS) {
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route", process.env.PARALLEL_EVENTS);
				this.socket.emit("PARALLEL_1", { room: "route", message: "Hi Parallel 1" });
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route", process.env.PARALLEL_EVENTS);
				this.socket.emit("PARALLEL_1", { room: "route", message: "Hi Parallel 1" });
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2", process.env.PARALLEL_EVENTS);
				this.socket.emit("PARALLEL_2", { room: "route-2", message: "Second route Parallel 2" });
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-2", process.env.PARALLEL_EVENTS);
			}
		});
	}

	loadOneAtATimeEvents(
		handleSuccess = (response) => {},
		handleError = (error) => {}
	) {
		// Fixes messages appearing multiple times.
		if (process.env.ONE_AT_A_TIME_EVENTS) {
			this.socket.on(MESSAGING_EVENTS.SUCCESS, handleSuccess);
			this.socket.on(MESSAGING_EVENTS.ERROR, handleError);
			return true;
		}
		return false;
	}

	loadParallelEvents(
		handleSuccess = (response) => {},
		handleError = (error) => {}
	) {
		if (process.env.PARALLEL_EVENTS) {
			for (const eventId of TestParallelEvents.eventIds) {
				this.socket.on(`${eventId}_${MESSAGING_EVENTS.SUCCESS}`, handleSuccess);
				this.socket.on(`${eventId}_${MESSAGING_EVENTS.ERROR}`, handleError);
			}
			return true;
		}
		return false;
	}
}

export default Client;