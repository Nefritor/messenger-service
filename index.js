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

const STANDART_PORT = 3333;
const SECURED_PORT = 3334;

const serverSecured = https.createServer(options, app).listen(SECURED_PORT, () => {
    console.log(`Server started on ${SECURED_PORT}`);
});

const serverStandard = app.listen(STANDART_PORT, () => {
    console.log(`Server started on ${STANDART_PORT}`);
});

const WebSocketServers = [
    WSExpress(app, serverSecured).getWss(),
    WSExpress(app, serverStandard).getWss()
];

WebSocketServers.forEach((wss, i) => {
    const serverName = i === 0 ? 'secured' : 'standart';

    const broadcast = getBroadcaster(wss);

    setAppRoutes(app, getRoutes(broadcast));

    openWS(app, {
        url: '/rooms',
        onOpen: (ws, req) => {
            console.log(`[${serverName}]: user connected - total: ${wss.clients.size}`);
        },
        onMessage: (ws, data) => {
            console.log(`[${serverName}]: message received`, data);
        },
        onClose: (ws, code) => {
            console.log(`[${serverName}]: user disconnected (${code}) - total: ${wss.clients.size}`);
        }
    });

    openWS(app, {
        url: '/room/:roomId/:user',
        onOpen: (ws, req) => {
            ws.roomId = req.params.roomId;
            ws.user = req.params.user;
            console.log(`[${serverName}]: user (${ws.user}) connected to ${ws.roomId} - total: ${wss.clients.size}`);
        },
        onMessage: (ws, data) => {
            console.log(`[${serverName}]: message received`, data);
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
            console.log(`[${serverName}]: user disconnected from ${ws.roomId} (${code}) - total: ${wss.clients.size}`);
        }
    });
})
