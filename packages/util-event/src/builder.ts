import { Server } from "socket.io";

type EventType = 'ONE_AT_A_TIME' | 'PARALLEL';

type Event<T extends EventType> = 
    T extends 'ONE_AT_A_TIME' ? {
        label: string;
        /**
         * @param data Passes information from the client to the server.
         * @param io Server io. Can emit information from the server to the client.
         */
        callback: (data: any, io: Server) => void;
    } : T extends 'PARALLEL' ? {
        id: string;
        label: string;
        /**
         * @param data Passes information from the client to the server.
         * @param eventId Event's id.
         * @param io Server io. Can emit information from the server to the client.
         */
        callback: (data: any, eventId: string, io: Server) => void;
    } : never;

const isEnvVariableDisabled = {
    oneAtATime: false,
    parallel: false
};

class EventBuilder {
    private events: Event<EventType>[] = [];
    private eventIds: string[] = [];

    /**
     * Type guard to check if the event is a parallel event.
     * Ref: https://blog.logrocket.com/how-to-use-type-guards-typescript/
     */
    private isParallel(event: Event<EventType>): event is Event<'PARALLEL'> {
        return (event as Event<'PARALLEL'>).id ? true : false;
    }

    /**
     * 1. Raise flag(s) if env variable(s) for events are disabled for event's type. If true, exit and enable ability to send a warning message to the console.
     * 2. Add an event. If event is parallel, add the event's id.
     * @param eventType Type of event.
     * @param event An event.
     * @throws Duplicate error if event is parallel and id already exists.
     */
    add<T extends EventType>(eventType: T, event: Event<T>) {
        if (eventType === 'ONE_AT_A_TIME' && isEnvVariableDisabled.oneAtATime) {
            return;
        }
        if (eventType === 'PARALLEL' && isEnvVariableDisabled.parallel) {
            return;
        }
        if (eventType === 'ONE_AT_A_TIME' && !process.env.ONE_AT_A_TIME_EVENTS) {
            isEnvVariableDisabled.oneAtATime = true;
            return;
        }
        if (eventType === 'PARALLEL' && !process.env.PARALLEL_EVENTS) {
            isEnvVariableDisabled.parallel = true;
            return;
        }
        if (this.isParallel(event)) {
            if (this.eventIds.includes(event.id)) {
                throw new Error(`Duplicate event id: ${event.id}`);
            }
            this.eventIds.push(event.id);
        }
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
    EventBuilder,
    isEnvVariableDisabled
};