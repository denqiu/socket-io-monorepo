// Built-in events are in lower case only.
// Custom events can be any character, any combination, and in any case (upper or lower case).
const BUILT_IN_IO_EVENTS = {
    connect_io_to_socket: 'connection'
};
const BUILT_IN_SOCKET_EVENTS = {
    connect_socket_to_io: 'connect',
    disconnect: 'disconnect'
};
const ROOM_EVENTS = {
    ENTER_ROOM: 'ENTER_ROOM',
    LEAVE_ROOM: 'LEAVE_ROOM'
};
const MESSAGING_EVENTS = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
};
export { 
    BUILT_IN_IO_EVENTS, BUILT_IN_SOCKET_EVENTS,
    ROOM_EVENTS, MESSAGING_EVENTS
};