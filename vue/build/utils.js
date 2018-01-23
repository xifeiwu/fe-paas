'use strict'
const path = require('path')
const config = require('./config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')
const HtmlWebpackPlugin = require('html-webpack-plugin')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
};

exports.contextPath = function() {
  return path.resolve(__dirname, '../');
};

exports.htmlTemplatePath = function () {
  return path.join(__dirname, 'config/index.tpl');
};

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

exports.chunksAndTemplates = () => {
  let vueBaseDir = exports.contextPath();

  let entries = {
    'galaxy': path.resolve(vueBaseDir, 'app-galaxy/entry.js'),
    'terminal': path.resolve(vueBaseDir, 'app-galaxy/terminal.js'),
  };
  let htmlConfigs = [
    {
      "filename": "galaxy.html",
      "title": "Galaxy",
      "cdn": {
        "js": [],
        "css": []
      },
      "chunks": ["galaxy"],
    },
    {
      "filename": "terminal.html",
      "title": "terminal",
      "cdn": {
        "js": ['./assets/libs/gateone.js'],
        "css": []
      },
      "chunks": ["terminal"],
    }
  ];

  if (process.env.NODE_ENV !== 'production') {
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
    it.chunks = ["vendor", "manifest"].concat(it.chunks);
    if (!it.hasOwnProperty('template')) {
      it.template = exports.htmlTemplatePath();
    }
    it.inject = true;
    it.chunksSortMode = 'dependency';
    return new HtmlWebpackPlugin(it);
    /**
      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: utils.htmlTemplatePath(),
        inject: true,
        // minify: {
        //   removeComments: true,
        //   collapseWhitespace: true,
        //   removeAttributeQuotes: true
        //   // more options:
        //   // https://github.com/kangax/html-minifier#options-quick-reference
        // },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency',
        chunks: ['manifest', 'vendor', 'app'],
        cdn: {
          css: [],
          js: ['./assets/libs/gateone.js']
        }
      })
     */
  });

  return {entries, templates}
};


