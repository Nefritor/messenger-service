import fs from 'fs';
import {getRoutes} from './Routes.js';
import {createApplication} from '../Base/Express.js';

export const startApp = ({ssl, showLog = true}) => {

    const log = (...args) => {
        if (showLog) {
            console.log(...args);
        }
    }

    const constructorAppConfig = {
        router: getRoutes,
        ...(ssl ? { port: 1235, options: ssl } : { port: 1234 })
    }

    createApplication(constructorAppConfig, log);
}
