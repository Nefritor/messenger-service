import {getRoutes} from './Routes.js';
import {createApplication} from '../Base/Express.js';

export const startApp = ({ssl, showLog = true}) => {

    const log = (...args) => {
        if (showLog) {
            console.log(...args);
        }
    }

    const appConfig = {
        router: getRoutes,
        ...(ssl ? { port: 3334, options: ssl } : { port: 3333 })
    }

    const [wss, broadcast, openWebSocket] = createApplication(appConfig, log);

    openWebSocket({
        url: '/rooms',
        onOpen: (ws, req) => {
            log(`user connected - total: ${wss.clients.size}`);
        },
        onMessage: (ws, data) => {
            log(`message received`, data);
        },
        onClose: (ws, code) => {
            log(`user disconnected (${code}) - total: ${wss.clients.size}`);
        }
    });

    openWebSocket({
        url: '/room/:roomId/:user',
        onOpen: (ws, req) => {
            ws.roomId = req.params.roomId;
            ws.user = req.params.user;
            log(`user (${ws.user}) connected to ${ws.roomId} - total: ${wss.clients.size}`);
        },
        onMessage: (ws, data) => {
            log(`message received`, data);
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
            log(`user disconnected from ${ws.roomId} (${code}) - total: ${wss.clients.size}`);
        }
    });
}
