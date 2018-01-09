/**
 * Created by 高乐天 on 17/7/14.
 */

const HttpProxy = require('http-proxy');
const pathMatch = require('path-match');
const L = require('nirvana-logger')('proxy');

/**
 * Constants
 */

const proxy = HttpProxy.createProxyServer({
  changeOrigin: false,
  hostRewrite: false
});
const route = pathMatch({
  // path-to-regexp options
  sensitive: false,
  strict: false,
  end: false,
});

module.exports.setProxyEvent = function(event, handle) {
  proxy.on(event, handle);
};

/**
 * Koa Http Proxy Middleware
 */
module.exports.proxy = (context, options) => (ctx, next) => {
  // create a match function
  const match = route(context);
  const matchResults = match(ctx.req.url);
  if (!matchResults) return next();

  let opts = options;
  if (typeof options === 'function') {
    opts = options.call(options, matchResults);
  }

  const {logs, pathRewrite} = opts;

  return new Promise((resolve, reject) => {
    ctx.req.oldPath = ctx.req.url;

    if (typeof pathRewrite === 'function') {
      ctx.req.url = pathRewrite(ctx.req.url, matchResults);
    }

    if (logs) {
      L(ctx.req.method, ctx.req.oldPath, 'to', opts.target + ctx.req.url);
    }

    proxy.web(ctx.req, ctx.res, opts, e => {
      const status = {
        ECONNREFUSED: 503,
        ETIMEOUT: 504,
      }[e.code];
      if (status) ctx.status = status;
      resolve();
    });
  });
};