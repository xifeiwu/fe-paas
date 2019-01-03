import bytes from 'bytes';
import utils from 'assets/libs/element-ui/utils';
class Utils {
  constructor() {
    this.ONE_MILLION = 1024 * 1024;
    this.redis = {
      rules: {
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
        leaveTime: [{
          required: true,
          type: 'number',
          message: '请选择试用期限',
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
      }
    }
  }

  formatTooltipForMemory(val) {
    return bytes(val);
  }
}
export default new Utils();