import { Server } from "socket.io";

type EventResponseType = {
    responseType: string;
    message: any;
};

class EventResponder {
    private eventId: string;
    private io: Server;

    constructor(eventId: string, io: Server) {
        this.eventId = eventId;
        this.io = io;
    }

    getEventId() {
        return this.eventId;
    }

    emitToClient<T extends EventResponseType>(response: { [Props in keyof T]: T[Props]; }) {
        this.io.emit(`${this.eventId}_RESPONSE`, response);
    }
}

// Ref: HTMLElementTagNameMap, K extends keyof HTMLElementTagNameMap in node_modules/typescript/lib/lib.dom.d.ts

/**
 * Enable or disable event type at project level. It's valid to enforce events that only run either ONE_AT_A_TIME or PARALLEL.
 */
const eventTypes = {
    "ONE_AT_A_TIME": { enabled: true },
    "PARALLEL": { enabled: true }
};

type EventType = keyof typeof eventTypes;

type EventDisplayType = "SERVER" | "FRAMEWORK";

type FrameworkSideEvent = {
    id: string;
    label: string;
    description: string;
};

type ServerSideEvent<T extends EventType> = {
    [Props in keyof FrameworkSideEvent]: FrameworkSideEvent[Props]; } & {
    /**
     * @param data Information passed from the client to the server.
     * @param responder Passes information from the server to the client.
     */
    callback: (data: any, responder: EventResponder) => void;
    getType: () => T;
};

const EventConfig = {
    eventTypes,
    listEventTypes: () => Object.keys(eventTypes) as EventType[]
};

/**
 * Event Id tracker at project level.
 */
let trackEventIds: string[] = [];

class EventBuilder {
    private events: ServerSideEvent<EventType>[] = [];

    /**
     * Add an event.
     * 1. If event's type is disabled, exit.
     * 2. If event is ONE_AT_A_TIME, event's type is used as id. If id is absent, add id otherwise skip. Duplicate ONE_AT_A_TIME ids are not allowed.
     * 3. If event is PARALLEL, add the event's id.
     * @param eventType Type of event.
     * @param event An event.
     * @throws Duplicate error if event is parallel and id already exists.
     */
    add<T extends EventType>(eventType: T, event: { [Props in keyof ServerSideEvent<T>]: ServerSideEvent<T>[Props]; }) {
        if (!EventConfig.eventTypes[eventType].enabled) {
            return;
        }
        if (eventType === 'ONE_AT_A_TIME') {
            event.id = eventType;
            if (!trackEventIds.includes(eventType)) {
                trackEventIds.push(eventType);
            }
        } else if (eventType === 'PARALLEL') {
            if (trackEventIds.includes(event.id)) {
                throw new Error(`Duplicate event id: ${event.id}`);
            }
            trackEventIds.push(event.id);
        }
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }
}

export {
    type FrameworkSideEvent,
    type EventDisplayType,
    type EventType,
    type EventResponseType,
    EventResponder,
    EventBuilder,
    EventConfig
};