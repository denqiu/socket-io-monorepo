import { io } from "socket.io-client";
import { BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS, MESSAGING_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 */

class Client {
	constructor() {
        this.socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);
    }

	/**
	 * 1. Demonstrates special socket.emit case only in server that triggers RangeError when passing the server's io to callback function.
	 * 2. Hardcoded socket.emits testing data being passed to callback and error handling.
	 */
	testConnectionToServer() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
			// Note: Listening to custom events should be handled outside. Doing that here stacks the same listener every time client disconnects and reconnects or whenever nodemon reloads. In other words, the same message appears multiple times.
			/**
			 * @type {EventType}
			 */
			let roomType;
			if (process.env.ONE_AT_A_TIME_EVENTS) {
				// this.socket.on(MESSAGING_EVENTS.SUCCESS, (response) => {
				// 	console.log(response);
				// });
				// this.socket.on(MESSAGING_EVENTS.ERROR, (error) => {
				// 	console.error(`[Error] ${error}`);
				// });
				roomType = 'ONE_AT_A_TIME';
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route", roomType);
				this.socket.emit(roomType, { room: "route", serverTest: true, showIoError: true }, (data, io) => {});
				this.socket.emit(roomType, { room: "route", serverTest: true, message: "hi" }, (data) => console.log(`Client: ${data.message}`));
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route", roomType);
				this.socket.emit(roomType, { room: "route", serverTest: true, message: "hi" }, (data) => console.log(data.message));
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2", roomType);
				this.socket.emit(roomType, { room: "route-2", serverTest: true, message: "second route" }, (data) => console.log(`Client: ${data.message}`));
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-2", roomType);
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-error", roomType);
				this.socket.emit(roomType, { room: "route-error", serverTest: true, message: "Cannot throw error here. Error handling ends up happening in client and not server, crashing the app." }, (data) => {
					try {
						throw new Error("Threw error");
					} catch (error) {
					}
				});
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-error", roomType);
			}
			if (process.env.PARALLEL_EVENTS) {
				roomType = 'PARALLEL';
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route", roomType);
				this.socket.emit("PARALLEL_1", { room: "route", message: "Hi Parallel 1" });
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route", roomType);
				this.socket.emit("PARALLEL_1", { room: "route", message: "Hi Parallel 1" });
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-2", roomType);
				this.socket.emit("PARALLEL_2", { room: "route-2", message: "Second route Parallel 2" });
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-2", roomType);
				this.socket.emit(ROOM_EVENTS.ENTER_ROOM, "route-error", roomType);
				this.socket.emit("PARALLEL_ERROR", { room: "route-error" });
				this.socket.emit(ROOM_EVENTS.LEAVE_ROOM, "route-error", roomType);
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
		}
	}

	/**
	 * @param {string[]} eventIds 
	 */
	loadParallelEvents(
		handleSuccess = (response) => {},
		handleError = (error) => {},
		eventIds
	) {
		if (process.env.PARALLEL_EVENTS) {
			for (const eventId of eventIds) {
				this.socket.on(`${eventId}_${MESSAGING_EVENTS.SUCCESS}`, handleSuccess);
				this.socket.on(`${eventId}_${MESSAGING_EVENTS.ERROR}`, handleError);
			}
		}
	}
}

export default Client;