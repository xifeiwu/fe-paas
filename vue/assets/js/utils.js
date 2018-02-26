class Utils {
  constructor() {}
  isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  isInteger(n) {
    return Number.isInteger(n);
  }

  isString(n) {
    return n instanceof String;
  }

  isDate(n) {
    return n instanceof Date;
  }

  /**
   * transfer to formated date string
   * @date timestamp of date
   * @fmt the format of result, such as yyyy-MM-dd hh:mm:ss
   */
  formatDate(date, fmt) {
    if (!date) {
      return '未知';
    }
    if (!this.isDate(date)) {
      if (this.isString(date)) {
        date = parseInt(date);
      }
      if (this.isNumber(date)) {
        date = new Date(date);
      }
    }
    // console.log('date');
    // console.log(date);
    var o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      'S': date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  }

  // error will occur when this function is called
  fix() {
    Object.prototype.renameProperty = function(oldName, newName) {
      // Do nothing if the names are the same
      if (oldName == newName) {
        return this;
      }
      // Check for the old property name to avoid a ReferenceError in strict mode.
      if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
      }
      return this;
    };
  }

  renameProperty(obj, old_key, new_key) {
    if (old_key !== new_key) {
      Object.defineProperty(obj, new_key,
        Object.getOwnPropertyDescriptor(obj, old_key));
      delete obj[old_key];
    }
  }

  theSame(value1, value2) {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }

  /**
   * used only in front-end, as window.location.search is used
   * @param e the key in queryString, such as id in 'http://...?id=12'
   * @returns {null} the value of key
   */
  getQueryString(e) {
    var t = new RegExp('(^|&)' + e + '=([^&]*)(&|$)', 'i'),
      n = window.location.search.substr(1).match(t);
    if (null !== n) {
      var o = n[2];
      return o = o.replace(/(%22|%3E|%3C|<|>)/g, 'MM'), '' === o ? null : decodeURIComponent(o);
    }
    return null;
  }

  /*
   * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
   * @param fn {function}  需要调用的函数
   * @param delay  {number}    延迟时间，单位毫秒
   * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
   * @return {function}实际调用函数
   */
  throttle(fn, delay, immediate, debounce) {
    var curr = +new Date(), //当前事件
      last_call = 0,
      last_exec = 0,
      timer = null,
      diff, //时间差
      context, //上下文
      args,
      exec = function() {
        last_exec = curr;
        fn.apply(context, args);
      };
    return function() {
      curr = +new Date();
      context = this,
        args = arguments,
        diff = curr - (debounce ? last_call : last_exec) - delay;
      clearTimeout(timer);
      if (debounce) {
        if (!immediate) {
          timer = setTimeout(exec, delay);
        } else if (diff >= 0) {
          exec();
        }
      } else {
        if (diff >= 0) {
          exec();
        } else if (!immediate) {
          timer = setTimeout(exec, -diff);
        }
      }
      last_call = curr;
    }
  }

  /*
   * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 delay，fn 才会执行
   * @param fn {function}  要调用的函数
   * @param delay   {number}    空闲时间
   * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
   * @return {function}实际调用函数
   */
  debounce(fn, delay, immediate) {
    return this.throttle(fn, delay, immediate, true);
  }

  error(msg, where) {
    console.log(`error in ${where}`);
    console.log(msg)
  }
}

export default new Utils();