import { Server } from "socket.io";

type Event = {
    id: string;
    label: string;
    callback: (data: any, eventId: string, io: Server) => void;
};

class EventBuilder {
    private events: Event[] = [];
    private eventIds: string[] = [];
    private isParallel: boolean;

    constructor(isParallel: boolean = true) {
        this.isParallel = isParallel;
    }

    addEvent(event: Event) {
        if (this.isParallel && this.eventIds.includes(event.id)) {
            throw new Error(`Duplicate event id: ${event.id}`);
        }
        this.eventIds.push(event.id);
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }

    getEventIds() {
        return this.eventIds;
    }
}

export { EventBuilder };