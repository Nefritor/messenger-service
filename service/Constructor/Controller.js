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
        ...(ssl ? { port: 3336, options: ssl } : { port: 3335 })
    }

    createApplication(appConfig, log);
}
