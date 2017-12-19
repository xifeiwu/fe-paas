var Utils = function() {
  // this.fix();
}

Utils.prototype = {
  isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  isInteger: function(n) {
    return Number.isInteger(n);
  },

  isString: function(n) {
    return n instanceof String;
  },

  isDate: function(n) {
    return n instanceof Date;
  },
  /**
   * transfer to formated date string
   * @date timestamp of date
   * @fmt the format of result, such as
   */
  formatDate: function(date, fmt) {
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
  },

  // error will occur when this function is called
  fix: function () {
    Object.prototype.renameProperty = function (oldName, newName) {
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
  },

  renameProperty: function(obj, old_key, new_key) {
    if (old_key !== new_key) {
      Object.defineProperty(obj, new_key,
        Object.getOwnPropertyDescriptor(obj, old_key));
      delete obj[old_key];
    }
  },

  theSame: function (value1, value2) {
    return JSON.stringify(value1) === JSON.stringify(value2);
  },

  error: function(msg, where) {
    console.log(`error in ${where}`);
    console.log(msg)
  },
}

export default new Utils();
