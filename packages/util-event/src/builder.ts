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

//[code-review/comments, Comment Id: 01JEMYRYR568X66J2H9P0X7SZ7] Ref: HTMLElementTagNameMap, K extends keyof HTMLElementTagNameMap in node_modules/typescript/lib/lib.dom.d.ts

/**
 * [code-review/comments, Comment Id: 01JEMYRYR6CBPVDT7B6JKSDNKV]
 * Enable or disable event type at project level. It's valid to enforce events that only run either ONE_AT_A_TIME or PARALLEL.
 */
const eventTypes = {
    "ONE_AT_A_TIME": { enabled: true },
    "PARALLEL": { enabled: true }
};

//[code-review/comments, Comment Id: 01JEMYRYR70A7DPC3N5MNRSAFH] keyof works on objects with typeof.
type EventType = keyof typeof eventTypes;

type EventDisplayType = "SERVER" | "FRAMEWORK";

type FrameworkSideEvent = {
    /**
     * Id is marked optional because it's assumed for ONE_AT_A_TIME events. No need to provide Id.
     * However, throws error if Id is not provided for PARALLEL events.
     */
    id?: string;
    label: string;
    description: string;
};

type ServerSideEvent<T extends EventType> = {
    [Props in keyof FrameworkSideEvent]: FrameworkSideEvent[Props]; } & {
    /**
     * [code-review/comments, Comment Id: 01JEMYRYR8M0YWB5W1SMPQ3JNM]
     * @param data Information passed from the client to the server.
     * @param responder Passes information from the server to the client.
     */
    callback: (data: any, responder: EventResponder) => void;
    /**
     * Event type is assumed. No need to provide it.
     */
    getType?: () => T;
};

const EventConfig = {
    eventTypes,
    listEventTypes: () => Object.keys(eventTypes) as EventType[]
};

/**
 * [code-review/comments, Comment Id: 01JEMYRYR9DAMEBRG98SQ2SC9E]
 * Event Id tracker at project level.
 */
const trackEventIds: string[] = [];

class EventBuilder {
    private events: ServerSideEvent<EventType>[] = [];

    /**
     * [code-review/comments, Comment Id: 01JEMYRYR9AAV8D8B1YWZM6S3K]
     * Add an event.
     * 1. If event's type is disabled, exit.
     * 2. If event is ONE_AT_A_TIME, event's type is used as id. If id is absent, add id otherwise skip adding id to avoid duplicating it.
     * 3. If event is PARALLEL, add the event's id. If id is absent, throw error.
     * @param eventType Type of event.
     * @param event An event.
     * @throws If event is parallel, Required id error if id is not provided. If id already exists, Duplicate error.
     */
    add<T extends EventType>(eventType: T, event: { [Props in keyof ServerSideEvent<T>]: ServerSideEvent<T>[Props]; }) {
        if (!EventConfig.eventTypes[eventType].enabled) {
            return;
        }
        event.getType = () => eventType;
        if (eventType === 'ONE_AT_A_TIME') {
            event.id = eventType;
            if (!trackEventIds.includes(eventType)) {
                trackEventIds.push(eventType);
            }
        } else if (eventType === 'PARALLEL') {
            if (!event.id) {
                throw new Error(`Id is required for ${eventType} events.`);
            } else if (trackEventIds.includes(event.id)) {
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