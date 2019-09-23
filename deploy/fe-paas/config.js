const fs = require('fs');
const path = require('path');

var env = process.env.NODE_ENV;

function getPort() {
  var port = 6001;
  // process.env.PORT is set in pm2.config.js
  // the following port switch will be used for npm run dev(test)
  switch (env) {
    case 'production':
    case 'test':
      port = 80;
      break;
    case 'dev':
    case 'local':
      port = 6001;
      break;
  }
  // PORT set by user has the max priority
  if (process.env.PORT) {
    port = process.env.PORT;
  }
  return port
}

function getServer(server) {
  var paasServer = 'http://10.10.202.143:30334';
  var assistServer = 'http://10.10.80.242:6002';
  var cdnServer = 'http://10.10.80.242:6002';
  switch (env) {
    case 'production':
      paasServer = 'http://galaxy-web-server.galaxy.production';
      assistServer = 'http://172.31.160.106:6002';
      break;
    case 'production_gray':
      paasServer = 'http://172.31.160.103:30334';
      assistServer = 'http://172.31.160.106:6002';
      break;
    case 'test':
      paasServer = 'http://10.10.202.143:30334';
      break;
    case 'dev':
      paasServer = 'http://10.10.58.126:30334';
      break;
    case 'local':
      paasServer = 'http://10.10.202.143:30334';
      // assistServer = 'http://127.0.0.1:6002';
      break;
  }
  if (process.env.PAAS_SERVER) {
    paasServer = process.env.PAAS_SERVER;
  }
  if (process.env.ASSIST_SERVER) {
    assistServer = process.env.ASSIST_SERVER;
  }
  return {
    paasServer, assistServer
  }[server];
}

const config = {
  dev: {
    host: '127.0.0.1',
    autoOpenBrowser: false,
    errorOverlay: true,
    assetsPublicPath: __dirname,
    poll: ''
  }
};

const serverConfig = {
  logDir: null,
  historyApiFallback: {
    rewrites: [
      // { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      { from: /^\/$/, to: '/index.html' },
      { from: /^\/index(\/.*)*$/, to: '/index.html' },
      { from: /^\/login(\/.*)*$/, to: '/login.html' },
      { from: /^\/paas-login(\/.*)*$/, to: '/login.html' },
      { from: /^\/cas-login(\/.*)*$/, to: '/login.html' },
      { from: /^\/user(\/.*)*$/, to: '/user.html' },
      { from: /^\/terminal(\/.*)*$/, to: '/terminal.html' },
      { from: /^\/instance-terminal(\/.*)*$/, to: '/instance-terminal.html' },
      { from: /^\/docs(\/.*)*$/, to: '/docs.html' },
      { from: /^\/profile(\/.*)*$/, to: '/profile.html' },
      { from: /^\/manage(\/.*)*$/, to: '/manage.html' },
      { from: /^\/.*/, to: '/page-not-found.html' },
    ],
  },
  host: '127.0.0.1' || config.dev.host,
  port: getPort(),
  staticPath: path.resolve(__dirname, 'dist'),
  proxy: {
    '/j-api/paas/': {
      target: 'http://10.10.202.143:30334',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: path => path.replace('\/j-api\/paas', ''),
    },
    '/n-api/assist': {
      target: 'http://10.10.80.242:6002',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: path => path.replace('\/n-api\/assist', ''),
    },
    '/n-api/': {
      target: 'http://127.0.0.1:6003',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: path => path.replace('\/n-api', ''),
    },
  },
};

module.exports = serverConfig;
