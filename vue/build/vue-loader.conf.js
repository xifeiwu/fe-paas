'use strict'

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const utils = require('./utils')
const config = require('./config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  cssLoaderConfig: {
    loaders: utils.cssLoaders({
      sourceMap: sourceMapEnabled,
      extract: isProduction
    }),
    cssSourceMap: sourceMapEnabled,
    cacheBusting: config.dev.cacheBusting,
    transformToRequire: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  },
  sassLoaderConfig: ExtractTextPlugin.extract({
    use: [{
      loader: "css-loader"
    }, {
      loader: "sass-loader"
    }],
    // use style-loader in development
    fallback: "style-loader"
  })
}
