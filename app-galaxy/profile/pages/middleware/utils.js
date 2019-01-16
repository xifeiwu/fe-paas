import bytes from 'bytes';
import utils from 'assets/libs/element-ui/utils';
class Utils {
  constructor() {
    this.ONE_MILLION = 1024 * 1024;
    const commonRules = {
      remainingDays: [{
        required: true,
        type: 'number',
        message: '请选择剩余有效天数',
        trigger: 'blur'
      }],
    };
    this.redisRules = Object.assign(commonRules, {
      name: [{
        required: true,
        message: '请输入实例名称',
        trigger: 'blur'
      }, {
        validator: (rule, values, callback) => {
          const reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
          let passed = true;
          if (!reg.exec(values)) {
            passed = false;
            callback('可以包含小写字符数字或中划线，但不能以中划线开始或结尾');
          }
          if (passed) {
            callback();
          }
        }
      }],
      versionId: [{
        required: true,
        type: 'number',
        message: '请选择实例版本',
        trigger: 'blur'
      }],
      clusterId: [{
        required: true,
        type: 'number',
        message: '请选择运行环境',
        trigger: 'blur'
      }],
      memory: [{
        required: true,
        type: 'number',
        message: '请选择内存大小',
        trigger: 'blur'
      }],
      userName: [{
        required: true,
        message: '请输入用户名',
        trigger: 'blur'
      }, {
        validator: utils.generateValidator(true, false, 2, 30, true)
      }],
      password: [{
        required: true,
        message: '请输入密码',
        trigger: 'blur'
      }, {
        validator: utils.generateValidator(true, false, 2, 30, true)
      }],
    });
    this.mariadbRules = Object.assign(commonRules, {
      name: [{
        required: true,
        message: '请输入实例名称',
        trigger: 'blur'
      }, {
        validator: (rule, values, callback) => {
          const reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
          let passed = true;
          if (!reg.exec(values)) {
            passed = false;
            callback('可以包含小写字符数字或中划线，但不能以中划线开始或结尾');
          }
          if (passed) {
            callback();
          }
        }
      }],
      versionId: [{
        type: 'number',
        required: true,
        message: '请选择实例版本',
        trigger: 'blur'
      }],
      cpu: [{
        type: 'number',
        required: true,
        message: '请选择CPU类型',
        trigger: 'blur'
      }],
      memory: [{
        type: 'number',
        required: true,
        message: '请选择内存大小',
        trigger: 'blur'
      }],
      disk: [{
        type: 'number',
        required: true,
        message: '请选择磁盘大小',
        trigger: 'blur'
      }],
      dbName: [{
        required: true,
        message: '请输入数据库名称',
        trigger: 'blur'
      }, {
        validator: utils.generateValidator(true, false, 2, 30, true)
      }],
      userName: [{
        required: true,
        message: '请输入用户名',
        trigger: 'blur'
      }, {
        validator: utils.generateValidator(true, false, 2, 30, true)
      }],
      password: [{
        required: true,
        message: '请输入密码',
        trigger: 'blur'
      }, {
        validator: utils.generateValidator(true, false, 2, 30, true)
      }],
      comment: [{
        validator(rule, values, callback) {
          if (values.length > 100) {
            callback('长度不能超过100个字符');
            return;
          }
          callback();
        }
      }]
    });
  }

  formatTooltipForMemory(val) {
    return bytes(val);
  }
}
export default new Utils();