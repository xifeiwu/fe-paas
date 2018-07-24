const path = require('path');

const serverApi = {
  production: 'http://galaxy-web-server.paastest.production',
  beta: 'http://galaxy-web-server.paastest.beta',
  test: 'http://galaxy-web-server.paastest.test',
  performance: 'http://galaxy-web-server.paastest.performance',
  fpdev: 'http://galaxy-web-server.paastest.fpdev',
};
const env = process.env.NODE_ENV;

module.exports = {
  // 静态资源目录配置
  webRoot: {
    prefix: '/',
    root: path.join(__dirname, 'dist'),
  },
  fallback: true,
  fallbackOption: {
    index: 'index.html',
    rewrites: [
      { from: /^\/$/, to: '/index.html' },
      { from: /^\/login/, to: '/login.html' },
      { from: /^\/user/, to: '/user.html' },
      { from: /^\/terminal/, to: '/terminal.html' },
      { from: /^\/docs/, to: '/docs.html' },
      { from: /^\/(profile|app|work-order|config-server|instance|service|domain|log|oauth|cdn)/, to: '/profile.html' },
    ],
    verbose: true
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
