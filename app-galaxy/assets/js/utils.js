import pathToRegexp from 'path-to-regexp';
import BaseUtils from '$assets/js/utils';

export default class Utils extends BaseUtils {
  constructor() {
    super();
    this.pathToRegexp = pathToRegexp;
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
}