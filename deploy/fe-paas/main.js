const config = require('./config');
const SpaServer = require('./spa-server');

console.log('NODE_ENV =', process.env.NODE_ENV, ', PORT0 =', process.env.PORT0);

const app = new SpaServer();
app.start(config);

