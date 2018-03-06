var path = require('path');
var cooking = require('cooking');

var vueBaseDir = path.resolve(__dirname, '../');

var multiPageConfig = {
  "bundles": [
    {
      "name": "galaxy",
      "entry": path.resolve(vueBaseDir, 'app-galaxy/entry.js'),
    },
    {
      "name": "terminal",
      "entry": path.resolve(vueBaseDir, 'app-galaxy/terminal.js'),
    },
    // {
    //   "entry": "admin",
    //   "title": "后台",
    //   "cdn": {}
    // }
  ],
  "templates": [
    {
      "name": "galaxy",
      "title": "凡普云平台",
      "cdn": {
        "js": [
          // '/cdn.jsdelivr.net/npm/vue@2.5.2/dist/vue.runtime.min.js',
          //   'https://unpkg.com/vue-router/dist/vue-router.js'
        ],
        "css": []
      },
      "chunks": ["galaxy"],
      "template": path.resolve(vueBaseDir, 'app-galaxy/index.tpl'),
    },
    {
      "name": "terminal",
      "title": "实例终端",
      "cdn": {
        "js": [
          // '/cdn.jsdelivr.net/npm/vue@2.5.2/dist/vue.runtime.min.js',
          //   'https://unpkg.com/vue-router/dist/vue-router.js'
        ],
        "css": []
      },
      "chunks": ["terminal"],
      "template": path.resolve(vueBaseDir, 'app-galaxy/index.tpl'),
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
var RUN_TEST = true;
if (RUN_TEST) {
  multiPageConfig.bundles.push({
    "name": "element",
    "entry": path.resolve(vueBaseDir, 'app-test/element.js'),
  });
  multiPageConfig.bundles.push({
    "name": "custom",
    "entry": path.resolve(vueBaseDir, 'app-test/custom.js'),
  });
  multiPageConfig.templates.push({
    "name": "element",
    "title": "element-ui-demo",
    "cdn": {
      "js": [],
      "css": []
    },
    "chunks": ["element"],
    "template": path.resolve(vueBaseDir, 'app-test/index.tpl'),
  });
  multiPageConfig.templates.push({
    "name": "custom",
    "title": "custom-component-demo",
    "cdn": {
      "js": [],
      "css": []
    },
    "chunks": ["custom"],
    "template": path.resolve(vueBaseDir, 'app-test/index.tpl'),
  });
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
      chunks: ["vendor", "manifest"].concat(it.chunks)
    }
  });
}

var cookingConfig = {
  entry: entries(),
  dist: path.resolve(vueBaseDir, 'dist'),
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
    'element-ui': vueBaseDir,
    'utils': vueBaseDir + '/src',
    'element': vueBaseDir + '/packages',
    'components': vueBaseDir + '/components',
  },
  extends: ['vue2', 'sass'],
  // extends: ['vue2', 'sass', 'autoprefixer'],
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     "React": "react",
  //   }),
  // ]
};

cooking.set(cookingConfig);

// cooking.add('loader.demo1.vue', {
//   test: /demo1\.vue$/,
//   loaders: ['babel-loader'],
//   exclude: /node_modules/
// });

cooking.add('loader.scss', {
  test: /\.scss$/,
  loaders: ['style-loader', 'css-loader', 'sass-loader']
});
cooking.add('loader.js', {
  test: /\.js/,
  loaders: ['babel-loader?compact=false']
});

cookingResolve = cooking.resolve()

module.exports = cookingResolve;