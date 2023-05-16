import minimist from 'minimist';

import {startApp as startMessengerApp} from './service/Messenger/Controller.js';
import {startApp as startConstructorApp} from './service/Constructor/Controller.js';

const {secured = false} = minimist(process.argv.splice(2));

startMessengerApp({secured, showLog: false});

startConstructorApp({secured});
