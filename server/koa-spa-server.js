const path = require('path');
const koaServer = require('./koa-spa-server');
// const L = require('nirvana-logger')('example');
const port = process.env.PORT0 || 7002;

const proxyTable = {
  '/api/(.*)': {
    target: 'http://172.16.106.191:30333',
    changeOrigin: false,
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