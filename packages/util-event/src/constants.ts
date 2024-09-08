// Built-in events are in lower case only.
// Custom events can be any character, any combination, and in any case (upper or lower case).
export const BUILT_IN_IO_EVENTS = {
    connect_io_to_socket: 'connection'
};
export const BUILT_IN_SOCKET_EVENTS = {
    connect_socket_to_io: 'connect',
    disconnect: 'disconnect'
};
export const ROOM_EVENTS = {
    ENTER_ROOM: 'ENTER_ROOM',
    LEAVE_ROOM: 'LEAVE_ROOM'
};
export const MESSAGING_EVENTS = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
};