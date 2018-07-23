const path = require('path');

const serverApi = {
  production: 'http://172.31.160.106:30334',
  beta: 'http://10.10.232.93:8091',
  test: 'http://10.10.202.143:30333',
  fpdev: 'http://10.10.202.143:30333',
};
const env = process.env.NODE_ENV;

module.exports = {
  // 静态资源目录配置
  webRoot: {
    prefix: '/',
    root: path.join(__dirname, 'dist'),
  },
  // 代理配置
  proxyTable: {
    '/api/': {
      target: serverApi[env],
      changeOrigin: true,
      logs: true,
      pathRewrite: path => path.replace('\/api\/', '\/'),
    },
  },
};
