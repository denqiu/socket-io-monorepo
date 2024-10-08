import { io } from "socket.io-client";
import { BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS } from "@dqiu/util-event";
import ServerUtil from "@dqiu/util-server";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 * @typedef {import("@dqiu/util-event").EventResponseType} EventResponseType
 */

const socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);

class Client {
	/**
	 * @param {string[]} eventIds 
	 * @param {{ [responseType: string]: (...data: any[]) => void }} responses 
	 */
	constructor(eventIds, responses) {
        this.socket = socket;
		this.eventIds = eventIds;
		this.responses = responses;
    }

	/**
	 * 1. Demonstrates special socket.emit case only in server that triggers RangeError when passing the server's io to callback function.
	 * 2. Hardcoded socket.emits testing data being passed to callback and error handling.
	 */
	testConnectionToServer() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
			// Note: Listening to custom events should be handled outside. Doing that here stacks the same listener every time client disconnects and reconnects or whenever nodemon reloads. In other words, the same message appears multiple times.
			this.socket.emit("SAMPLE_EVENT", { message: "sample test"});
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
				this.socket.emit(roomType, { room: "route-error", serverTest: true, message: "Cannot throw error here. Error handling will end up occurring in client and not in server, thus crashing the app." }, (data) => {
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
		this.socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, () => {
			console.log("[Client] Server disconnected.");
		});
	}

	testFramework() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
		});
	}
	listenToEventResponses() {
		/**
		 * @param {{ [Props in keyof EventResponseType]: EventResponseType[Props] }} response 
		 */
		const responder = (response) => this.responses[response.responseType](response.message);
		this.socket.on("SAMPLE_EVENT_RESPONSE", responder);
		if (process.env.ONE_AT_A_TIME_EVENTS) {
			/**
			 * @type {EventType}
			 */
			const eventId = 'ONE_AT_A_TIME';
			this.socket.on(`${eventId}_RESPONSE`, responder);
		}

		if (process.env.PARALLEL_EVENTS) {
			for (const eventId in this.eventIds) {
				this.socket.on(`${eventId}_RESPONSE`, responder);
			}
		}
	}

	removeEventResponses() {
		/**
		 * @param {{ [Props in keyof EventResponseType]: EventResponseType[Props] }} response 
		 */
		const responder = (response) => this.responses[response.responseType](response.message);
		if (process.env.ONE_AT_A_TIME_EVENTS) {
			/**
			 * @type {EventType}
			 */
			const eventId = 'ONE_AT_A_TIME';
			this.socket.off(`${eventId}_RESPONSE`, responder);
		}

		if (process.env.PARALLEL_EVENTS) {
			for (const eventId in this.eventIds) {
				this.socket.off(`${eventId}_RESPONSE`, responder);
			}
		}
	}
}

export default Client;