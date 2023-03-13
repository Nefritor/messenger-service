import {v4 as createUUID} from 'uuid';

const lifeTime = 30 * 1000;

const rooms = [];
const timers = [];

setInterval(() => {
    if (timers.length) {
        timers.forEach((timer) => {
            console.log(`${rooms.find((room) => room.id === timer.id).title}: time left ${Math.ceil((timer.killTime - Date.now()) / 1000)} seconds`);
        })
    }
}, 1000);

const createRoom = (title) => {
    if (!rooms.some((room) => room.title === title)) {
        const uuid = createUUID();
        rooms.push({
            id: uuid,
            title
        });
        // setTimer(uuid);
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

const setTimer = (id) => {
    const killTime = Date.now() + lifeTime;
    timers.push({
        id,
        killTime,
        timeout: setTimeout(() => {
            removeRoom(id);
            removeTimer(id);
        }, lifeTime)
    })
}

const removeTimer = (id) => {
    const index = timers.findIndex((timer) => timer.id === id);
    if (index !== -1) {
        timers.splice(index, 1);
        return true;
    }
    return false;
}

const getRooms = () => rooms;

export {
    getRooms,
    getRoomData,
    createRoom,
    removeRoom
}
