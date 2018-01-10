const path = require('path');
const koa = require('koa');
const statics = require('./koa-static');
const compress = require('koa-compress');
const rewrite = require('./koa-rewrite');
const koaproxy = require('./koa-proxy');
const L = require('nirvana-logger')('spa-server');
const _ = require('lodash');
const nirvanaOauth = require('nirvana-oauth');
var cors = require('koa-cors');
// const HttpsProxyAgent = require('https-proxy-agent');

const defaultOption = {
  // 静态目录
  webRoot: {
    prefix: '/',
    root: path.join(__dirname, '../example'),
  },
  // 单页应用
  fallback: true,
  // 服务端口
  port: process.env.PORT0 || 7002,
  // 启用压缩
  compress: {
    filter(content_type) {
      return /text/i.test(content_type);
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH,
  },
};

class SpaServer {
  constructor(option = {}) {
    this.option = _.merge({}, defaultOption, option);

    L('配置', this.option);

    const app = this.app = new koa();
    // app.use(cors());

    // app.use(function (ctx, next) {
    //   const start = Date.now();
    //   console.log(start);
    //   next();
    //   const ms = Date.now() - start;
    //   console.log('X-Response-Time', `${ms}ms`);
    //   ctx.set('X-Response-Time', `${ms}ms`);
    // });

    // 压缩
    if (this.option.compress) {
      app.use(compress(this.option.compress));
    }

    // 代理
    if (this.option.proxyTable) {
      // 设置代理
      setProxy(app, option.proxyTable);
      koaproxy.setProxyEvent('proxyReq', (proxyReq, req, res) => {
        // console.log(proxyReq);
        // console.log(req.headers);
        // console.log(res.headers);
      });
      koaproxy.setProxyEvent('proxyRes', (proxyRes, req, res) => {
        // console.log(proxyRes.headers);
        proxyRes.headers['access-control-allow-origin'] = '*'
        delete proxyRes.headers['access-control-allow-credentials'];
        // console.log(req.headers);
        // console.log(res);
        proxyRes.on('data', function (chunk) {
          //
          // This is the data from the target server, but modifying
          // it will not affect the outgoing `res`.
          //
          // console.log('data', chunk.toString());
        });
        proxyRes.on('finish', function (chunk) {
          // console.log('finish', chunk.toString());
        });
      });
    }

    this.option.oAuth = false;
    if (this.option.oAuth) {
      nirvanaOauth.getBearerToken(this.option.oAuth).then((bearerToken) => {
        koaproxy.setProxyEvent('proxyReq', (proxyReq) => {
          proxyReq.setHeader('Authorization', bearerToken);
        });
      })
    }

    // url重写
    this.option.fallback = false;
    if (this.option.fallback) {
      this.app.use(rewrite({verbose: false}));
    }

    if (this.option.webRoot) {
      this.setStatic(this.option.webRoot);
    }
  }

  // 中间件
  use(fn) {
    this.app.use(fn);
  }

  // 指定静态目录
  setStatic(webRoot) {
    const {prefix, root} = webRoot;
    this.app.use(statics(root, {prefix}));
  }

  // 代理事件
  setProxyEvent(event, eventHandle) {
    koaproxy.setProxyEvent(event, eventHandle);
  }

  // 启动服务
  start() {
    const {port} = this.option;
    this.app.listen(port);
    L('服务已启动', port);
  }
}

// 设置代理
function setProxy(app, proxyTable) {
  if (typeof proxyTable !== 'object')  throw new Error('proxyTable must be jsobject');

  Object.keys(proxyTable).forEach(item => {
    let options = proxyTable[item];
    if (typeof options === 'string') {
      options = {
        target: options,
        changeOrigin: true,
        logs: true,
      };
    }
    // 应用代理中间件
    app.use(koaproxy.proxy(item, options));
  });
}

module.exports = SpaServer;