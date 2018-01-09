'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');
const resolve = require('path').resolve;
const assert = require('assert');
const debug = require('debug')('koa-static');
const send = require('koa-send');

/**
 * Expose `serve()`.
 */

module.exports = serve;

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 *
 */

/*
 - Options
 -  maxage   Browser cache max-age in milliseconds. defaults to 0
 -  hidden   Allow transfer of hidden files. defaults to false
 -  index    Default file name, defaults to 'index.html'
 -  defer    If true, serves after yield next, allowing any downstream middleware to respond first.
 -  gzip     Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists. defaults to true.
 -  prefix   prefix the url,default /
 -  suffix   suffix the url
 */

function serve(root, opts) {
  opts = opts || {};

  assert(root, 'root directory is required to serve files');

  // options
  debug('static "%s" %j', root, opts);
  opts.root = resolve(root);
  if (opts.index !== false) opts.index = opts.index || 'index.html';
  let url = opts.prefix || opts.url || '/';
  //prefix url
  if (url.substr(0, 1) !== '/')
    url = '/' + url;
  if (url.substr(-1) !== '/')
    url += '/';
  if (!opts.defer) {
    return function *serve(next) {
      if (this.method !== 'HEAD' && this.method !== 'GET') return;
      let pathUrl = this.path;
      if (url.replace(/^\//, '').replace(/\/$/, '') === pathUrl.replace(/^\//, '').replace(/\/$/, '')) {
        yield send(this, '/', opts);
      } else if (pathUrl.substr(0, url.length) === url) {
        let sub = pathUrl.replace(url, '');
        //如果有后缀 则添加后缀
        yield send(this, sub + (opts.suffix || ''), opts);
      } else {
        yield* next;
      }
    };
  }

  return function *serve(next) {
    yield* next;

    if (this.method !== 'HEAD' && this.method !== 'GET') return;
    // response is already handled
    if (this.body !== null || this.status !== 404) return;

    let pathUrl = this.path;
    if (url.replace(/^\//, '').replace(/\/$/, '') === pathUrl.replace(/^\//, '').replace(/\/$/, '')) {
      yield send(this, '/', opts);
    } else if (pathUrl.substr(0, url.length) === url) {
      let sub = pathUrl.replace(url, '');
      yield send(this, sub + (opts.suffix || ''), opts);
    }
  };
}