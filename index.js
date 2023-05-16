import fs from 'fs';

import minimist from 'minimist';

import {startApp as startMessengerApp} from './service/Messenger/Controller.js';
import {startApp as startConstructorApp} from './service/Constructor/Controller.js';

const {secured = false} = minimist(process.argv.splice(2));

const ssl = secured && {
    key: fs.readFileSync('./ssl/privatekey.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem')
}

startConstructorApp({ssl});

startMessengerApp({ssl});

