'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('./config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: false })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        // { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/index(\/.*)*$/, to: '/index.html' },
        { from: /^\/login(\/.*)*$/, to: '/login.html' },
        { from: /^\/user(\/.*)*$/, to: '/user.html' },
        { from: /^\/terminal(\/.*)*$/, to: '/terminal.html' },
        { from: /^\/docs(\/.*)*$/, to: '/docs.html' },
        { from: /^\/profile(\/.*)*$/, to: '/profile.html' },
        { from: /^\/manage(\/.*)*$/, to: '/manage.html' },
        { from: /^\/.*/, to: '/page-not-found.html' },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: {
      '/j-api/paas/': {
        target: 'http://10.10.202.143:30334',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: path => path.replace('\/j-api\/paas', ''),
      },
      '/n-api/assist': {
        target: 'http://10.10.80.242:6002',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: path => path.replace('\/n-api\/assist', ''),
      },
      '/n-api/': {
        target: 'http://127.0.0.1:6003',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: path => path.replace('\/n-api', ''),
      },
    },
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('./config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: utils.htmlTemplatePath(),
    //   inject: true
    // }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
