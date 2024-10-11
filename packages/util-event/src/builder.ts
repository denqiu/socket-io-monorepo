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
const OneAtATimeEvent = {
    type: "",
    label: "",
    /**
     * @param data Passes information from the client to the server.
     * @param responder Passes information from the server to the client.
     */
    callback: (data: any, responder: EventResponder) => {},
};

const ParallelEvent = {
    id: "",
    ...OneAtATimeEvent
};

const EventMap = {
    "ONE_AT_A_TIME": OneAtATimeEvent,
    "PARALLEL": ParallelEvent
};

type EventType = keyof typeof EventMap;

type Event<T extends EventType> = typeof EventMap[T];

const EventHelper = (() => {
    const listEventTypes = () => Object.keys(EventMap) as EventType[];
    const eventTypes = {} as { [eventType in EventType]: { enabled: boolean }};
    for (const eventType of listEventTypes()) {
        eventTypes[eventType] = { enabled: true };
    }
    return {
        /**
         * Enable or disable event type at project level. It's valid to enforce events that only run either one-at-a-time or parallel.
         */
        eventTypes,
        listEventTypes
    };
})();

class EventBuilder {
    private events: Event<EventType>[] = [];
    private eventIds: string[] = [];

    /**
     * Add an event. If event's type is disabled, exit. If event is parallel, add the event's id.
     * @param eventType Type of event.
     * @param event An event.
     * @throws Duplicate error if event is parallel and id already exists.
     */
    add<T extends EventType>(eventType: T, event: { [Props in keyof Event<T>]: Event<T>[Props]; }) {
        if (!EventHelper.eventTypes[eventType].enabled) {
            return;
        }
        if (eventType === 'PARALLEL') {
            const parallelEvent = event as typeof ParallelEvent;
            if (this.eventIds.includes(parallelEvent.id)) {
                throw new Error(`Duplicate event id: ${parallelEvent.id}`);
            }
            this.eventIds.push(parallelEvent.id);
        }
        event.type = eventType;
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }

    getEventIds() {
        return this.eventIds;
    }
}

export {
    type EventType,
    type EventResponseType,
    EventResponder,
    EventBuilder,
    EventHelper
};