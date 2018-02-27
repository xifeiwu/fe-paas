const process = require('process');
const path = require('path');
const koaServer = require('./koa-spa-server');
// const L = require('nirvana-logger')('example');
var port = process.env.PORT || 80;

var javaServer = null;
/**
 * process.env.NODE_ENV, server vs vue
 * test: production
 * dev: testing
 */

switch (process.env.NODE_ENV) {
  case 'production':
  case 'test':
    javaServer = 'http://10.10.202.143:30333';
    port = 80;
    break;
  case 'dev':
  default:
    javaServer = 'http://172.16.49.130:30333';
    javaServer = 'http://galaxy-web-server.galaxy.test';
    // javaServer = 'http://10.10.202.143:30333';
    port = 7002;
    break;
}
const proxyTable = {
  // '/api/service/queryTerminalInfo': {
  //   target: 'http://172.16.49.130:30333',
  //   changeOrigin: true,
  //   logs: true,
  //   pathRewrite: function (url, match) {
  //     return '/service/queryTerminalInfo'
  //   }
  // },
  '/api/(.*)': {
    target: javaServer,
    changeOrigin: true,
    logs: true,
    pathRewrite: function (url, match) {
      return '/' + match['0'];
    }
  },
  '/openapi': {
    target: 'http://localhost:8000',
    changeOrigin: false,
    logs: true,
  },
};

// 创建服务
const server = new koaServer({
  port,
  proxyTable,
  fallback: true,
  staticConfig: {
    dir: path.join(__dirname, '../vue/dist'),
    options: {
      maxAge: 0,
      // maxAge: 3600 * 24,
      gzip: true,
      // prefix: 'assets',
      // preload: false,
      alias: {
        '/galaxy': '/galaxy.html',
        '/': '/galaxy.html'
      }
    }
  },
});

// 静态目录
// server.setStatic('/', path.join(__dirname, '.'));
// 启动服务
server.start();
