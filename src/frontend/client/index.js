import { io } from "socket.io-client";
import { EventConfig, BUILT_IN_SOCKET_EVENTS, ROOM_EVENTS } from "@dqiu/util-event";
import { ROUTE_EVENTS } from "@dqiu/util-route";
import ServerUtil from "@dqiu/util-server";

/**
 * @typedef {import("@dqiu/util-event").EventType} EventType
 * @typedef {import("@dqiu/util-event").EventResponseType} EventResponseType
 * @typedef {import("@dqiu/util-route").FrameworkSideRoutes} FrameworkSideRoutes
 */

const socket = io(ServerUtil.NODE_ENV === 'development' ? `http://localhost:${ServerUtil.backendPort}` : window.location.origin);

/**
 * Rules:
 * 1. Client send event ids to server on connection to trigger events.
 * 2. Client listens to event responses outside connection.
 */
class Client {
	constructor() {
        this.socket = socket;
    }

	/**
	 * The client's first rule hardcoded. Test disconnect and connection events.
	 * 
	 * 1. Demonstrates special socket.emit case only in server that triggers RangeError when passing the server's io to callback function.
	 * 2. Hardcoded socket.emits testing data being passed to callback and error handling.
	 */
	testConnectionToServer() {
		this.socket.on(BUILT_IN_SOCKET_EVENTS.disconnect, (reason, details) => {
			console.warn(`[Warning] Client: Server disconnected due to ${reason}.\n${details}`);
		});
		this.socket.on(BUILT_IN_SOCKET_EVENTS.connect_socket_to_io, () => {
			/**
			 * @type {EventType}
			 */
			let roomType;
			if (EventConfig.eventTypes.ONE_AT_A_TIME.enabled) {
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
			if (EventConfig.eventTypes.PARALLEL.enabled) {
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

	/**
	 * @param {(routes: { [Props in keyof FrameworkSideRoutes]: FrameworkSideRoutes[Props] }) => void} responder 
	 */
	listenToRouteResponse(responder) {
		this.socket.on(`${ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER}_RESPONSE`, responder);
	}

	/**
	 * @param {(routes: { [Props in keyof FrameworkSideRoutes]: FrameworkSideRoutes[Props] }) => void} responder 
	 */
	turnOffRouteResponse(responder) {
		this.socket.off(`${ROUTE_EVENTS.SEND_ROUTES_FROM_SERVER}_RESPONSE`, responder);
	}

	/**
	 * @param {string} eventId
	 * @param {(response: { [Props in keyof EventResponseType]: EventResponseType[Props] }) => void} responder 
	 */
	listenToEventResponse(eventId, responder) {
		this.socket.on(`${eventId}_RESPONSE`, responder);
	}

	/**
	 * @param {string} eventId
	 * @param {(response: { [Props in keyof EventResponseType]: EventResponseType[Props] }) => void} responder 
	 */
	turnOffEventResponse(eventId, responder) {
		this.socket.off(`${eventId}_RESPONSE`, responder);
	}
}

export default Client;