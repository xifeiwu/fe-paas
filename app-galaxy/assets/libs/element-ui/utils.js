class Utils {
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

export default new Utils();