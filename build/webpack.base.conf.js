'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('./config')
const webpack = require('webpack');
const customLoader = require('./vue-loader.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

// chunksAndTemplates is used to config bundle-js and html
const chunksAndTemplates = (() => {
  let vueBaseDir = utils.contextPath();

  let entries = {
    'index': path.resolve(vueBaseDir, 'app-galaxy/index.js'),
    'docs': path.resolve(vueBaseDir, 'app-galaxy/docs.js'),
    'login': path.resolve(vueBaseDir, 'app-galaxy/login/entry.js'),
    'profile': path.resolve(vueBaseDir, 'app-galaxy/profile.js'),
    'user': path.resolve(vueBaseDir, 'app-galaxy/user.js'),
    'terminal': path.resolve(vueBaseDir, 'app-galaxy/terminal.js'),
  };
  let htmlConfigs = [
    {
      "filename": "index.html",
      "title": "凡普云-首页",
      "cdn": {
        "js": [],
        "css": ['/assets/libs/element-ui/element-ui.css']
      },
      "chunks": ["index"],
    },
    {
      "filename": "docs.html",
      "title": "凡普云-帮助",
      "cdn": {
        "js": [],
        "css": ['/assets/libs/element-ui/element-ui.css']
      },
      "chunks": ["docs"],
    },
    {
      "filename": "login.html",
      "title": "凡普云-登录",
      "cdn": {
        "js": [],
        "css": ['/assets/libs/element-ui/element-ui.css']
      },
      "chunks": ["login"],
    },
    {
      "filename": "profile.html",
      "title": "凡普云-控制台",
      "cdn": {
        "js": [],
        "css": ['/assets/libs/element-ui/element-ui.css']
      },
      "chunks": ["profile"],
    },
    {
      "filename": "user.html",
      "title": "凡普云-用户中心",
      "cdn": {
        "js": [],
        "css": ['/assets/libs/element-ui/element-ui.css']
      },
      "chunks": ["user"],
    },
    {
      "filename": "terminal.html",
      "title": "凡普云-实例终端",
      "cdn": {
        "js": ['/assets/libs/gateone.js'],
        "css": []
      },
      "chunks": ["terminal"],
    }
  ];

  // var more = process.env.NODE_ENV !== 'production';
  var more = false;
  if (more) {
    entries['element'] = path.resolve(vueBaseDir, 'app-test/element.js');
    entries['custom'] = path.resolve(vueBaseDir, 'app-test/custom.js');
    htmlConfigs.push({
      "filename": "element.html",
      "title": "element-ui-demo",
      "cdn": {
        "js": [],
        "css": []
      },
      "chunks": ["element"],
    });
    htmlConfigs.push({
      "filename": "custom.html",
      "title": "custom-component-demo",
      "cdn": {
        "js": [],
        "css": []
      },
      "chunks": ["custom"],
    })
  }

  let templates = htmlConfigs.map(it => {
    it.chunks = ["manifest"].concat(it.chunks);
    if (!it.hasOwnProperty('template')) {
      it.template = path.join(__dirname, 'config/index.tpl');
    }
    it.inject = true;
    it.chunksSortMode = 'dependency';
    return new HtmlWebpackPlugin(it);
  });

  return {entries, templates}
})();

var baseConfig = {
  context: utils.contextPath(),
  entry: chunksAndTemplates.entries,
  output: {
    path: config.build.assetsRoot,
    filename: "[name].[hash].js",
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.scss', '.sass'],
    alias: {
      'element-ui': utils.contextPath() + '/element-ui',
      'components': utils.contextPath() + '/components',
      'assets': utils.contextPath() + '/assets',
      '$assets': utils.contextPath() + '/app-galaxy/assets',
      '$components': utils.contextPath() + '/app-galaxy/components',
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: customLoader.cssLoaderConfig
      },
      {
        test: /\.js$/,
        include: utils.contextPath(),
        exclude: /node_modules|bower_components/,
        loaders: ['babel-loader']
        // include: [resolve('app-galaxy'), resolve('app-text'), resolve("packages"), resolve('src'),
        //   resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: chunksAndTemplates.templates.concat([
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(utils.contextPath(), 'assets/static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(utils.contextPath(), 'app-galaxy/assets/static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new webpack.ProvidePlugin({
      'window.browserDebug': [path.resolve(utils.contextPath(), 'assets/libs/debug/browser.js')],
      'browserDebug': [path.resolve(utils.contextPath(), 'assets/libs/debug/browser.js')],
    }),
  ]),
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};

module.exports = baseConfig;
