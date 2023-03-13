import cors from 'cors';
import express from 'express';
import https from 'https';
import http from 'http';
import WSExpress from 'express-ws';

import {getBroadcaster} from './WebSocket.js';

export const createApplication = ({options, port, router}) => {
    const app = _getApplication();

    const server = (() => {
        if (options) {
            return https.createServer(options, app).listen(port, () => {
                console.log(`Server started on ${port}`);
            });
        }
        return http.createServer(app).listen(port, () => {
            console.log(`Server started on ${port}`);
        });
    })();

    const wss = WSExpress(app, server).getWss();

    const broadcast = getBroadcaster(wss);

    setAppRoutes(app, router(broadcast));

    return [
        wss,
        broadcast,
        (config) => _openWebSocket(app, config)
    ];
}

export const setAppRoutes = (app, routes) => {
    routes.forEach((route) => {
        switch (route.type) {
            case 'get':
                app.get(route.url, _processRequest(route.callback));
                break;
            case 'post':
                app.post(route.url, _processRequest(route.callback));
                break;
            default:
                throw new Error(`Invalid route type: ${route.type}`);
        }
    })
}

const _getApplication = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    return app;
}

const _openWebSocket = (app, config) => {
    app.ws(config.url, (ws, req) => {
        config.onOpen(ws, req);
        ws.on('message', (msg) => {
            config.onMessage(ws, JSON.parse(msg));
        });
        ws.on('close', (code) => {
            config.onClose(ws, code);
        })
    })
}

const _processRequest = (callback) => {
    return (req, res) => {
        res.header("Content-Type", "application/json; charset=utf-8")
        callback({
            data: req.body,
            send: (data) => {
                return res.end(JSON.stringify(data), 'utf-8');
            },
            sendStatus: (statusCode) => {
                return res.sendStatus(statusCode);
            }
        })
    }
}
