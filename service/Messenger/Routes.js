import {createRoom, getRooms, getRoomData} from './Model/Rooms.js';

const getRoutes = (broadcast) => [{
    type: 'get',
    url: 'api/get-rooms',
    callback: ({send}) => {
        send(getRooms());
    }
}, {
    type: 'post',
    url: 'api/get-room-data',
    callback: ({data, send, sendStatus}) => {
        send(getRoomData(data.id));
    }
}, {
    type: 'post',
    url: 'api/create-room',
    callback: ({data, send, sendStatus}) => {
        const room = createRoom(data.title);
        if (room) {
            send(room);
            broadcast({type: 'rooms', data: getRooms()})
        } else {
            send(null);
        }
    }
}]

export {
    getRoutes
}