import fs from 'fs';
import {getRoutes} from './Routes.js';
import {createApplication} from '../Base/Express.js';

export const startApp = ({secured, showLog = true}) => {

    const log = (...args) => {
        if (showLog) {
            console.log(...args);
        }
    }

    const constructorAppConfig = {
        router: getRoutes,
        ...(secured ? {
            port: 5556,
            options: {
                key: fs.readFileSync('./ssl/privatekey.pem'),
                cert: fs.readFileSync('./ssl/certificate.pem')
            }
        } : {
            port: 5555
        })
    }

    createApplication(constructorAppConfig, log);
}
