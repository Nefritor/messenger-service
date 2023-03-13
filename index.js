import fs from 'fs';
import minimist from 'minimist';

import {getRoutes} from './service/Messenger/Routes.js';
import {createApplication} from './service/Base/Express.js';

const {secured = false} = minimist(process.argv.splice(2));

const appConfig = {
    router: getRoutes,
    ...(secured ? {
        port: 3334,
        options: {
            key: fs.readFileSync('./ssl/privatekey.pem'),
            cert: fs.readFileSync('./ssl/certificate.pem'),

        }
    } : {
        port: 3333
    })
}

const [wss, broadcast, openWebSocket] = createApplication(appConfig);

openWebSocket({
    url: '/rooms',
    onOpen: (ws, req) => {
        console.log(`user connected - total: ${wss.clients.size}`);
    },
    onMessage: (ws, data) => {
        console.log(`message received`, data);
    },
    onClose: (ws, code) => {
        console.log(`user disconnected (${code}) - total: ${wss.clients.size}`);
    }
});

openWebSocket({
    url: '/room/:roomId/:user',
    onOpen: (ws, req) => {
        ws.roomId = req.params.roomId;
        ws.user = req.params.user;
        console.log(`user (${ws.user}) connected to ${ws.roomId} - total: ${wss.clients.size}`);
    },
    onMessage: (ws, data) => {
        console.log(`message received`, data);
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
