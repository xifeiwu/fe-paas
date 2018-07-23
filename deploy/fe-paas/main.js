const SpaServer = require('koa-spa-server');
const config = require('./config');
const L = require('nirvana-logger')('main');

L('NODE_ENV =', process.env.NODE_ENV, ', PORT0 =', process.env.PORT0);
const app = new SpaServer(config);
app.start();
