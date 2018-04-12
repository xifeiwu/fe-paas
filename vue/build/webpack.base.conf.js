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
    'galaxy': path.resolve(vueBaseDir, 'app-galaxy/entry.js'),
    'terminal': path.resolve(vueBaseDir, 'app-galaxy/terminal.js'),
    'components': path.resolve(vueBaseDir, 'app-galaxy/components.js'),
  };
  let htmlConfigs = [
    {
      "filename": "galaxy.html",
      "title": "凡普云平台",
      "cdn": {
        "js": [],
        "css": []
      },
      "chunks": ["components", "galaxy"],
    },
    {
      "filename": "terminal.html",
      "title": "实例终端",
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
