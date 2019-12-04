import BaseUtils from '$assets/js/utils';

export default class Utils extends BaseUtils {
  constructor() {
    super();
    this.regMap = {
      mail: /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/,
      ipOnly: /^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})$/,
      ipWithMask: /^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})(\/[0-9]+)?$/,
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,61}$/,
      number: /^[0-9]+$/
    }
  }

  getReg(type) {
    let result = null;
    if (this.regMap.hasOwnProperty(type)) {
      result = this.regMap[type];
    }
    return result;
  }


  isNumber(val) {
    return typeof val === 'number' && !isNaN(parseFloat(val)) && isFinite(val);
  }

  isInteger(n) {
    return Number.isInteger(n);
  }

  isString(s) {
    return typeof(s) === 'string' || s instanceof String;
  }

  isDate(val) {
    return toString.call(val) === '[object Date]';
  }
  // isDate(n) {
  //   return n instanceof Date;
  // }

  isFile(val) {
    return toString.call(val) === '[object File]';
  }

  isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  isBuffer(obj) {
    return obj != null && obj.constructor != null &&
      typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }


  // isObject(value) {
  //   var type = typeof value;
  //   return value != null && (type == 'object' || type == 'function');
  // }
  isObject(val) {
    return val !== null && typeof val === 'object';
  }
  isPlainObject(obj) {
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    if (!obj || toStr.call(obj) !== '[object Object]') {
      return false;
    }

    var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    var key;
    for (key in obj) { /**/ }

    return typeof key === 'undefined' || hasOwn.call(obj, key);
  }


  isRegExp(obj) {
    return obj instanceof RegExp
  }
  isError(obj) {
    return obj instanceof Error
  }

  isUndefined(val) {
    return typeof val === 'undefined';
  }

  isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  isStream(val) {
    return this.isObject(val) && this.isFunction(val.pipe);
  }

  isArray(arr) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(arr);
    }
    return toString.call(arr) === '[object Array]';
  }

  isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }
  objectToQueryString (obj) {
    return Object.keys(obj).reduce(function (str, key, i) {
      var delimiter, val;
      delimiter = (i === 0) ? '?' : '&';
      key = encodeURIComponent(key);
      val = encodeURIComponent(obj[key]);
      return [str, delimiter, key, '=', val].join('');
    }, '');
  }

  parseQueryString(qs, sep, eq, options) {
    qs = qs.replace(/^[ ?]+/, '');
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
    try {
      var regexp = /\+/g;
      qs = qs.split(sep);
      var maxKeys = 1000;
      if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
      }
      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }
      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr, vstr, k, v;
        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        if (!obj.hasOwnProperty(k)) {
          obj[k] = v;
        } else if (Array.isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }
    } catch (error) {
      console.log('error in parseQueryString:');
      console.log(error);
      obj = {};
    }
    return obj;
  }

  formatMilliSeconds(ms) {
    const ss = 1000;
    const mi = ss * 60;
    const hh = mi * 60;
    const dd = hh * 24;

    const floatToInt = (v) => {
      return Math.floor(v);
    }

    var day = floatToInt(ms / dd);
    var hour = floatToInt((ms - day * dd) / hh);
    var minute = floatToInt((ms - day * dd - hour * hh) / mi);
    var second = floatToInt((ms - day * dd - hour * hh - minute * mi) / ss);
    var milliSecond = floatToInt(ms - day * dd - hour * hh - minute * mi - second * ss);

    var timeList = [];
    if(day > 0) {
      timeList.push(`${day}天`);
    }
    if(hour > 0) {
      timeList.push(`${hour}小时`);
    }
    if(minute > 0) {
      timeList.push(`${minute}分`);
    }
    if(second > 0) {
      timeList.push(`${second}秒`);
    }
    if(milliSecond > 0) {
      timeList.push(`${milliSecond}毫秒`);
    }
    return timeList.join('');
  }

  formatSeconds(ms) {
    const ss = 1000;
    const mi = ss * 60;
    const hh = mi * 60;
    const dd = hh * 24;

    const floatToInt = (v) => {
      return Math.floor(v);
    }

    var day = floatToInt(ms / dd);
    var hour = floatToInt((ms - day * dd) / hh);
    var minute = floatToInt((ms - day * dd - hour * hh) / mi);
    var second = floatToInt((ms - day * dd - hour * hh - minute * mi) / ss);

    var timeList = [];
    if(day > 0) {
      timeList.push(`${day}天`);
    }
    if(hour > 0) {
      timeList.push(`${hour}小时`);
    }
    if(minute > 0) {
      timeList.push(`${minute}分`);
    }
    if(second > 0) {
      timeList.push(`${second}秒`);
    }
    return timeList.join('');
  }

  // get Date from DateTime or timeStamp
  getDate(dateOrLong) {
    var result = dateOrLong;
    if (!(dateOrLong instanceof Date)) {
      result = new Date(dateOrLong);
    }
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result.getTime();
  }
  getDate2(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  // get day interval for two date
  getDaysInterval(current, target) {
    const ONE_DAY = 24 * 3600 * 1000;
    return parseInt((this.getDate(target) - this.getDate(current)) / ONE_DAY);
  }

  // copy from node module shvl
  shvlGet (object, path, def) {
    return (object = (path.split ? path.split('.') : path).reduce(function (obj, p) {
      return obj && obj[p]
    }, object)) === undefined ? def : object;
  }
  shvlSet  (object, path, val, obj) {
    return ((path = path.split ? path.split('.') : path).slice(0, -1).reduce(function (obj, p) {
      return obj[p] = obj[p] || {};
    }, obj = object)[path.pop()] = val), object;
  }

  /**
   * check if path exist in obj
   * @param {obj}, object
   * @param {path}, a.b.c
   */
  propExists(obj, path) {
    var value = path.split('.').reduce((obj, prop) => {
      return obj && obj.hasOwnProperty(prop) ? obj[prop] : undefined;
    }, obj);
    return value !== undefined;
  }

  // 等待ms毫秒
  async waitMilliSeconds(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }


  /**
   * generate Regexp and related desc
   * @param chinese
   * @param min
   * @param max
   * @param strict, if frequently used char, such as .@: is allowed
   * @returns {{reg: RegExp, desc: string}}
   */
  generateReg(chinese, min, max, strict) {
    let chineseState = {
      reg: '',
      desc: '',
    };
    if (chinese) {
      chineseState = {
        reg: '\u4e00-\u9fa5',
        desc: '中文'
      }
    }
    if (!min) {
      min = 1;
    }
    if (!max) {
      max = '';
    }
    let regStr = `^[${chineseState['reg']}A-Za-z0-9_\\-\\.@/:]{${min},${max}}$`;
    if (strict) {
      regStr = `^[${chineseState['reg']}A-Za-z0-9_\\-]{${min},${max}}$`;
    }
    let reg = new RegExp(regStr);
    let desc = `字符中只能包含字母、数字、下划线、中划线`;
    if (chineseState.reg) {
      desc = `${desc}，${chineseState['desc']}。`;
    }
    if (min > 1 && max != '') {
      desc = `${desc}长度${min}-${max}个字符`
    }
    return {reg, desc}
  }

  // generate validator for async-validator, which is used in form-item of element-ui
  generateValidator(required, chinese, min, max, strict) {
    let regStates = this.generateReg(chinese, min, max, strict);
    return function(rule, values, callback) {
      let passed = true;
      let reg = regStates.reg;
      if (!values) {
        if (required) {
          passed = false;
          callback('内容不能为空');
        }
      } else if (values.length > 0) {
        if (!reg.exec(values)) {
          passed = false;
          callback(regStates.desc);
        }
      }
      if (passed) {
        callback();
      }
    };
  }

  generateCountReg(min, max) {
    let regStr = `^.{${min},${max}}$`;
    let reg = new RegExp(regStr);
    let desc = `不能超过${max}个字符`;
    return {reg, desc}
  }

  /**
   * word-count check for form-item
   * @param required
   * @param min
   * @param max
   * @returns {Function}
   */
  generateCountValidator(required, min, max) {
    let regStates = this.generateCountReg(min, max);
    return function(rule, values, callback) {
      let passed = true;
      let reg = regStates.reg;
      if (!values) {
        if (required) {
          passed = false;
          callback('内容不能为空');
        }
      } else if (values.length > 0) {
        if (!reg.exec(values)) {
          passed = false;
          callback(regStates.desc);
        }
      }
      if (passed) {
        callback();
      }
    };
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (this.isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (this.isDate(val)) {
        result[key] = val;
      } else if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      this.forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Function equal to merge with the difference being that no reference
   * to original objects is kept.
   *
   * @see merge
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  deepMerge(...args) {
    const hasArray = args.some(it => Array.isArray(it));
    var result = {};
    if (hasArray) {
      args = args.filter(it => Array.isArray(it));
      result = [];
    }
    const assignValue = (val, key) => {
      if (this.isDate(val) || this.isRegExp(val) || null == val) {
        result[key] = val;
      } else if (Array.isArray(val)) {
        // override if origin is Array
        result[key] = this.deepMerge(val);
      } else if (typeof val === 'object') {
        if (typeof result[key] === 'object') {
          result[key] = this.deepMerge(result[key], val);
        } else {
          result[key] = this.deepMerge({}, val);
        }
      } else {
        result[key] = val;
      }
    };

    for (var i = 0, l = args.length; i < l; i++) {
      this.forEach(args[i], assignValue);
    }
    return result;
  }

  getRegFromStr(str) {
    return new RegExp(str);
  }
}