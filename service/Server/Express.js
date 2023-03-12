import cors from 'cors';
import express from 'express';

const getApplication = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());
    return app;
}

const setAppRoutes = (app, routes) => {
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

const openWS = (app, {url, onOpen, onMessage, onClose}) => {
    app.ws(url, (ws, req) => {
        onOpen(ws, req);
        ws.on('message', (msg) => {
            onMessage(ws, JSON.parse(msg));
        });
        ws.on('close', (code) => {
            onClose(ws, code);
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

export {
    getApplication,
    setAppRoutes,
    openWS
}