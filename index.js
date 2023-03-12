import {getRoutes} from './service/Messenger/Routes.js';
import {getApplication, setAppRoutes, openWS} from './service/Server/Express.js';
import {getBroadcaster} from './service/Server/WebSocket.js';

const [app, wss] = getApplication();

const broadcast = getBroadcaster(wss);

setAppRoutes(app, getRoutes(broadcast));

openWS(app, {
    url: '/rooms',
    onOpen: (ws, req) => {
        console.log(`user connected - total: ${wss.clients.size}`);
    },
    onMessage: (ws, data) => {
        console.log('message received', data);
    },
    onClose: (ws, code) => {
        console.log(`user disconnected (${code}) - total: ${wss.clients.size}`);
    }
});

openWS(app, {
    url: 'api/room/:roomId/:user',
    onOpen: (ws, req) => {
        ws.roomId = req.params.roomId;
        ws.user = req.params.user;
        console.log(`user (${ws.user}) connected to ${ws.roomId} - total: ${wss.clients.size}`);
    },
    onMessage: (ws, data) => {
        console.log('message received', data);
        switch (data.type) {
            case 'message':
                broadcast(data, (client) =>
                    ws.user !== client.user &&
                    client.roomId === ws.roomId
                );
                break;
            case 'statusChange':
                broadcast(data, (client) =>
                    ws.user !== client.user &&
                    client.roomId === ws.roomId &&
                    data.origin === client.user
                );
                break;
        }
    },
    onClose: (ws, code) => {
        console.log(`user disconnected from ${ws.roomId} (${code}) - total: ${wss.clients.size}`);
    }
});

const PORT = 3333;

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});