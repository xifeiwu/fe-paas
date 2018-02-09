const process = require('process');
const path = require('path');
const koaServer = require('./koa-spa-server');
// const L = require('nirvana-logger')('example');
const port = process.env.PORT0 || 7002;

var javaServer = null;
switch (process.env.NODE_ENV) {
  case 'test':
    javaServer = 'http://10.10.202.143:30333';
    break;
  case 'dev':
  default:
    javaServer = 'http://172.16.49.130:30333';
    javaServer = 'http://galaxy-web-server.galaxy.test';
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
  webRoot: {
    prefix: '/',
    root: path.join(__dirname, '../vue/dist'),
    // root: path.join(__dirname, 'dist'),
  },
});

// 静态目录
// server.setStatic('/', path.join(__dirname, '.'));
// 启动服务
server.start();