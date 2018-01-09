const path = require('path');
const koaServer = require('koa-spa-server');
// const L = require('nirvana-logger')('example');
const port = process.env.PORT0 || 7002;

const proxyTable = {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: false,
    logs: true,
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
});

// 静态目录
server.setStatic('/', path.join(__dirname, '.'));
// 启动服务
server.start();