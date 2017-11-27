var path = require('path');
var cooking = require('cooking');

var vueBaseDir = path.resolve(__dirname, '../');

var multiPageConfig = {
  "bundles": [
    {
      "name": "test",
      "entry": path.resolve(vueBaseDir, 'app/index.js'),
    },
    // {
    //   "entry": "home",
    //   "title": "首页",
    //   "cdn": {}
    // },
    // {
    //   "entry": "admin",
    //   "title": "后台",
    //   "cdn": {}
    // }
  ],
  "templates": [
    {
      "name": "test",
      "title": "VUE模块测试",
      "cdn": {
        "js": [],
        "css": []
      },
      "chunks": ["test"],
      "template": path.resolve(vueBaseDir, 'templates/test.tpl'),
    }

  ],
  "cdn": {
    "js": [
      // "//cdn.jsdelivr.net/vue/2.0.0-rc.7/vue.min.js",
      // "//cdn.jsdelivr.net/vuex/2.0.0-rc.5/vuex.min.js"
    ],
    "css": []
  },
  "externals": {
  }
}

var entries = function() {
  var result = {}
  multiPageConfig.bundles.forEach(it => {
    result[it.name] = it.entry;
  });
  return result
}

var merge = function(a, b) {
  return {
    css: (a.css || []).concat(b.css || []),
    js: (a.js || []).concat(b.js || [])
  }
}
var templates = function() {
  return multiPageConfig.templates.map(it => {
      return {
        title: it.title,
        filename: it.name + '.html',
        template: it.template,
        cdn: merge(multiPageConfig.cdn, it.cdn),
        chunks: ["manifest"].concat(it.chunks)
      }
    });
}

var cookingConfig = {
  entry: entries(),
  dist: path.resolve(vueBaseDir, '../server/dist'),
  template: templates(),

  devServer: {
    port: 8080,
    publicPath: '/'
  },

  // production
  clean: true,
  hash: true,
  sourceMap: true,
  minimize: true,
  chunk: true, // see https://cookingjs.github.io/zh-cn/configuration.html#chunk
  postcss: [
    // require('...')
  ],
  publicPath: './',
  // assetsPath: 'static',
  urlLoaderLimit: 10000,
  // static: true,
  extractCSS: '[name].[contenthash:7].css',
  alias: {
    // 'src': path.join(__dirname, 'src'),
    'element-ui': vueBaseDir
  },
  extends: ['vue2', 'sass', 'autoprefixer']
};

cooking.set(cookingConfig);

module.exports = cooking.resolve();