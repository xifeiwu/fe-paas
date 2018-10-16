const SpaServer = require('@paas/spa-server');
const config = require('./config');

console.log('NODE_ENV =', process.env.NODE_ENV, ', PORT0 =', process.env.PORT0);

const app = new SpaServer(config);
app.start();

