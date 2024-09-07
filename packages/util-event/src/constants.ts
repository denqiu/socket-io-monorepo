// Built-in events are in lower case only.
// Custom events can be any character, any combination, and in any case (upper or lower case).
export const BUILT_IN_IO_EVENTS = {
    connect_io_to_socket: 'connection'
};
export const BUILT_IN_SOCKET_EVENTS = {
    connect_socket_to_io: 'connect'
};
export const ROOM_EVENTS = {
    // associate each room with a route
    ENTER_ROUTE: 'ENTER_ROUTE',
    LEAVE_ROUTE: 'LEAVE_ROUTE'
};
export const MESSAGING_EVENTS = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
};