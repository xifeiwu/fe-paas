# koa-spa-server 用法

```js
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
```

## 选项配置

| 配置项 | 说明 | 
| --- | --- |
| port | 服务端口，默认 7880
| webRoot | 静态资源配置选项  {prefix: '前辍', root: '静态资源的绝对路径'}
| fallback | 是否启用 spa选项 默认 true
| compress | 压缩选项，默认启用
| proxyTable | 代理配置，参考

配置

```js
// config.js

const path = require('path');

const targets = {
  openapi: {
    local: 'http://10.10.232.242:8000',
    test: 'http://10.10.232.242:8000',
    production: 'http://10.10.232.242:8000',
  },
  api: {
    local: 'http://10.10.232.242:9000',
    test: 'http://10.10.232.242:9000',
    production: 'http://10.10.232.242:9000',
  },
};

const env = process.env.NODE_ENV || 'local';

module.exports = {
  // 静态资源
  webRoot: {
    prefix: '/',
    root: path.join(__dirname, '../example'),
  },
  // 代理配置
  proxyTable: {
    '/api/rong360': {
      target: targets.openapi[env],
      changeOrigin: true,
      logs: true,
      pathRewrite: path => path.replace('\/api\/', '\/'),
    },
    '/openapi': {
      target: targets.openapi[env],
      changeOrigin: true,
      pathRewrite: path => path.replace('\/openapi\/', '\/'),
    },
    '/api/(user|internal|bank|repay|payment|account|location|creditItem)': {
      target: targets.api[env],
      changeOrigin: true,
      logs: true,
      pathRewrite: path => path.replace('\/api\/', '\/puhui-nirvana-user\/'),
    },
    '/api/risk': {
      target: targets.api[env],
      changeOrigin: true,
      pathRewrite: path => path.replace('\/api\/risk/', '\/puhui-holmes-risk-assess/api/v2/'),
    },
    '/api/assets': {
      target: targets.api[env],
      changeOrigin: true,
      pathRewrite: path => path.replace('\/api\/assets\/', '\/puhui-core-server-cloud/api/'),
    },
  },
};
```


> 关于代理
> 
> http://forbeslindesay.github.io/express-route-tester/
> https://github.com/component/path-to-regexp
> 
> 路径正则验证
> 
> http://forbeslindesay.github.io/express-route-tester/

## 实例方法

- setStatics({prefix, root})

	设置静态资源
	
- start()
	
	启动服务




