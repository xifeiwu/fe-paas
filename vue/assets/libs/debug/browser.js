!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.debugBrowser=r():e.debugBrowser=r()}("undefined"!=typeof self?self:this,function(){return function(e){function __webpack_require__(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,__webpack_require__),n.l=!0,n.exports}var r={};return __webpack_require__.m=e,__webpack_require__.c=r,__webpack_require__.d=function(e,r,t){__webpack_require__.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:t})},__webpack_require__.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(r,"a",r),r},__webpack_require__.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=0)}([function(e,r,t){(function(n){function useColors(){return!("undefined"==typeof window||!window.process||"renderer"!==window.process.type)||("undefined"==typeof navigator||!navigator.userAgent||!navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))&&("undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))}function formatArgs(r){var t=this.useColors;if(r[0]=(t?"%c":"")+this.namespace+(t?" %c":" ")+r[0]+(t?"%c ":" ")+"+"+e.exports.humanize(this.diff),t){var n="color: "+this.color;r.splice(1,0,n,"color: inherit");var o=0,a=0;r[0].replace(/%[a-zA-Z%]/g,function(e){"%%"!==e&&(o++,"%c"===e&&(a=o))}),r.splice(a,0,n)}}function log(){return"object"==typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function save(e){try{null==e?r.storage.removeItem("debug"):r.storage.debug=e}catch(e){}}function load(){var e;try{e=r.storage.debug}catch(e){}return!e&&void 0!==n&&"env"in n&&(e=n.env.DEBUG),e}r.log=log,r.formatArgs=formatArgs,r.save=save,r.load=load,r.useColors=useColors,r.storage="undefined"!=typeof chrome&&void 0!==chrome.storage?chrome.storage.local:function(){try{return window.localStorage}catch(e){}}(),r.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],e.exports=t(2)(r),e.exports.formatters.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}).call(r,t(1))},function(e,r){function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}function runTimeout(e){if(t===setTimeout)return setTimeout(e,0);if((t===defaultSetTimout||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(r){try{return t.call(null,e,0)}catch(r){return t.call(this,e,0)}}}function runClearTimeout(e){if(n===clearTimeout)return clearTimeout(e);if((n===defaultClearTimeout||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{return n(e)}catch(r){try{return n.call(null,e)}catch(r){return n.call(this,e)}}}function cleanUpNextTick(){c&&a&&(c=!1,a.length?u=a.concat(u):s=-1,u.length&&drainQueue())}function drainQueue(){if(!c){var e=runTimeout(cleanUpNextTick);c=!0;for(var r=u.length;r;){for(a=u,u=[];++s<r;)a&&a[s].run();s=-1,r=u.length}a=null,c=!1,runClearTimeout(e)}}function Item(e,r){this.fun=e,this.array=r}function noop(){}var t,n,o=e.exports={};!function(){try{t="function"==typeof setTimeout?setTimeout:defaultSetTimout}catch(e){t=defaultSetTimout}try{n="function"==typeof clearTimeout?clearTimeout:defaultClearTimeout}catch(e){n=defaultClearTimeout}}();var a,u=[],c=!1,s=-1;o.nextTick=function(e){var r=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)r[t-1]=arguments[t];u.push(new Item(e,r)),1!==u.length||c||runTimeout(drainQueue)},Item.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=noop,o.addListener=noop,o.once=noop,o.off=noop,o.removeListener=noop,o.removeAllListeners=noop,o.emit=noop,o.prependListener=noop,o.prependOnceListener=noop,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(e,r,t){e.exports=function(e){function selectColor(e){var r,t=0;for(r in e)t=(t<<5)-t+e.charCodeAt(r),t|=0;return createDebug.colors[Math.abs(t)%createDebug.colors.length]}function createDebug(e){function debug(){if(debug.enabled){var e=debug,t=+new Date,n=t-(r||t);e.diff=n,e.prev=r,e.curr=t,r=t;for(var o=new Array(arguments.length),a=0;a<o.length;a++)o[a]=arguments[a];o[0]=createDebug.coerce(o[0]),"string"!=typeof o[0]&&o.unshift("%O");var u=0;o[0]=o[0].replace(/%([a-zA-Z%])/g,function(r,t){if("%%"===r)return r;u++;var n=createDebug.formatters[t];if("function"==typeof n){var a=o[u];r=n.call(e,a),o.splice(u,1),u--}return r}),createDebug.formatArgs.call(e,o);(e.log||createDebug.log).apply(e,o)}}var r;return debug.namespace=e,debug.enabled=createDebug.enabled(e),debug.useColors=createDebug.useColors(),debug.color=selectColor(e),debug.destroy=destroy,"function"==typeof createDebug.init&&createDebug.init(debug),createDebug.instances.push(debug),debug}function destroy(){var e=createDebug.instances.indexOf(this);return-1!==e&&(createDebug.instances.splice(e,1),!0)}function enable(e){createDebug.save(e),createDebug.names=[],createDebug.skips=[];var r,t=("string"==typeof e?e:"").split(/[\s,]+/),n=t.length;for(r=0;r<n;r++)t[r]&&(e=t[r].replace(/\*/g,".*?"),"-"===e[0]?createDebug.skips.push(new RegExp("^"+e.substr(1)+"$")):createDebug.names.push(new RegExp("^"+e+"$")));for(r=0;r<createDebug.instances.length;r++){var o=createDebug.instances[r];o.enabled=createDebug.enabled(o.namespace)}}function disable(){createDebug.enable("")}function enabled(e){if("*"===e[e.length-1])return!0;var r,t;for(r=0,t=createDebug.skips.length;r<t;r++)if(createDebug.skips[r].test(e))return!1;for(r=0,t=createDebug.names.length;r<t;r++)if(createDebug.names[r].test(e))return!0;return!1}function coerce(e){return e instanceof Error?e.stack||e.message:e}return createDebug.debug=createDebug.default=createDebug,createDebug.coerce=coerce,createDebug.disable=disable,createDebug.enable=enable,createDebug.enabled=enabled,createDebug.humanize=t(3),Object.keys(e).forEach(function(r){createDebug[r]=e[r]}),createDebug.instances=[],createDebug.names=[],createDebug.skips=[],createDebug.formatters={},createDebug.selectColor=selectColor,createDebug.enable(createDebug.load()),createDebug}},function(e,r){function parse(e){if(e=String(e),!(e.length>100)){var r=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(r){var c=parseFloat(r[1]);switch((r[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return c*u;case"days":case"day":case"d":return c*a;case"hours":case"hour":case"hrs":case"hr":case"h":return c*o;case"minutes":case"minute":case"mins":case"min":case"m":return c*n;case"seconds":case"second":case"secs":case"sec":case"s":return c*t;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return c;default:return}}}}function fmtShort(e){return e>=a?Math.round(e/a)+"d":e>=o?Math.round(e/o)+"h":e>=n?Math.round(e/n)+"m":e>=t?Math.round(e/t)+"s":e+"ms"}function fmtLong(e){return plural(e,a,"day")||plural(e,o,"hour")||plural(e,n,"minute")||plural(e,t,"second")||e+" ms"}function plural(e,r,t){if(!(e<r))return e<1.5*r?Math.floor(e/r)+" "+t:Math.ceil(e/r)+" "+t+"s"}var t=1e3,n=60*t,o=60*n,a=24*o,u=365.25*a;e.exports=function(e,r){r=r||{};var t=typeof e;if("string"===t&&e.length>0)return parse(e);if("number"===t&&!1===isNaN(e))return r.long?fmtLong(e):fmtShort(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}}])});