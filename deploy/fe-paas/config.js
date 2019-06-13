const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV;

class Config {
  getPort() {
    var port = 6001
    // process.env.PORT is set in pm2.config.js
    // the following port switch will be used for npm run dev(test)
    switch (process.env.NODE_ENV) {
      case 'production':
      case 'test':
      case 'dev':
        port = 80;
        break;
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

  getStaticPathList() {
    var fePassDir = null;
    ['../fe-paas/deploy/fe-paas/dist', 'node_modules/@paas/fe-paas/', 'dist'].map(it => {
      return path.resolve(__dirname, it);
    }).some(it => {
      if (fs.existsSync(it)) {
        fePassDir = it;
      }
      return fePassDir;
    })
    var staticPathList = [];
    if (fePassDir) {
      staticPathList = [fePassDir];
    }
    return staticPathList;
  }

  getProxyTable() {
    var paasServer = 'http://10.10.58.126:30334';
    var assistServer = 'http://10.10.80.242:6002';
    var cdnServer = 'http://10.10.80.242:6002';
    switch (process.env.NODE_ENV) {
      case 'production':
        paasServer = 'http://galaxy-web-server.galaxy.production';
        // paasServer = 'http://172.31.160.106:30334';
        assistServer = 'http://172.31.160.87:6002';
        break;
      case 'production_gray':
        paasServer = 'http://172.31.160.103:30334';
        assistServer = 'http://172.31.160.87:6002';
        break;
      case 'test':
        paasServer = 'http://10.10.202.143:30334';
        break;
      case 'dev':
        paasServer = 'http://10.10.58.126:30334';
        break;
      case 'local':
        paasServer = 'http://10.10.58.126:30334';
        paasServer = 'http://10.10.202.143:30334';
        assistServer = 'http://127.0.0.1:6002';
        break;
    }
    if (process.env.PAAS_SERVER) {
      paasServer = process.env.PAAS_SERVER;
    }
    if (process.env.ASSIST_SERVER) {
      assistServer = process.env.ASSIST_SERVER;
    }
    return {
      '/j-api/paas/': {
        target: paasServer,
        changeOrigin: true,
        logLevel: 'debug',
        // pathRewrite: path => path.replace('\/j-api\/paas', '/api'),
        pathRewrite: path => path.replace('\/j-api\/paas', ''),
      },
      '/n-api/assist': {
        target: assistServer,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: path => path.replace('\/n-api\/assist', ''),
      },
      '/n-api/': {
        target: cdnServer,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: path => path.replace('\/n-api', ''),
      }
    }
  }

  // 用于为connect-history-api-fallback配置未找到的url
  getFallbackOption() {
    // 为什么需要配置未找到的url？
    // 1. 避免路径中出现.html后缀(如，/profile.html的路径映射为/profile)；2.未找到的页面路径映射到页面page-not-found.html
    // 注意事项：
    // 1. 需要配置defaultTo避免将有效路径，（如healthCheck路径、代理路径）请求导入到page-not-found.html，
    // 2. defaultTo中的pathToIgnore和koa中间件的顺序密切相关
    const defaultTo = ({parsedUrl, match, request}) => {
      const pathname = parsedUrl.pathname;
      var match = false;
      const healthCheckPath = ['/health', '/healthcheck'];
      const proxyPrefixPath = ['/j-api', '/n-api'];
      const staticPath = ['/assets'];
      const pathToIgnore = staticPath;
      pathToIgnore.some(it => {
        match = pathname.startsWith(it);
        return match;
      });
      if (match) {
        return pathname;
      } else {
        return '/page-not-found.html';
      }
    };
    return {
      index: 'index.html',
      logger(type, ...args) {
        if ('Rewriting' === type) {
          const [method, from, direction, to] = args;
          // console.log(`${type}: ${from} -> ${to}`);
        }
      },
      rewrites: [
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
        { from: /^\/.*/, to: defaultTo},
      ],
      verbose: true
    }
  }
}

const config = new Config();

module.exports = {
  port: config.getPort(),

  fallbackOption: config.getFallbackOption(),

  staticPathList: config.getStaticPathList(),

  // 代理配置
  proxyTable: config.getProxyTable()
};
