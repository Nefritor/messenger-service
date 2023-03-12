import WSExpress from 'express-ws';
import fs from 'fs';
import https from 'https';

import {getRoutes} from './service/Messenger/Routes.js';
import {getApplication, setAppRoutes, openWS} from './service/Server/Express.js';
import {getBroadcaster} from './service/Server/WebSocket.js';

const options = {
    key: fs.readFileSync('./ssl/privatekey.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem'),
}

const app = getApplication();

const PORT = 3333;

const server = https.createServer(options, app).listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

const wss = WSExpress(app, server).getWss();

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
    url: '/room/:roomId/:user',
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
