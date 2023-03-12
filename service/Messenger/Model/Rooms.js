import {v4 as createUUID} from 'uuid';

const rooms = [];

const createRoom = (title) => {
    if (!rooms.some((room) => room.title === title)) {
        const uuid = createUUID();
        rooms.push({
            id: uuid,
            title
        })
        return uuid;
    }
}

const removeRoom = (id) => {
    const index = rooms.findIndex((room) => room.id === id);
    if (index !== -1) {
        rooms.splice(index, 1);
        return true;
    }
    return false;
}

const getRoomData = (id) => {
    const index = rooms.findIndex((room) => room.id === id);
    if (index !== -1) {
        return rooms[index];
    }
    return null;
}

const getRooms = () => rooms;

export {
    getRooms,
    getRoomData,
    createRoom,
    removeRoom
}