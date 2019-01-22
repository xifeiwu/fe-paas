import utils from 'assets/libs/element-ui/utils';

class AppInfoHelper {
  constructor() {
    let basicValidator = utils.generateValidator(true, true);
    let notRequriedBasicValidator = utils.generateValidator(false, true);
    let limit100 = utils.generateCountValidator(false, 0, 100);
    let limit100Required = utils.generateCountValidator(true, 0, 100);
    let limit200Required = utils.generateCountValidator(true, 0, 200);
    let limit256 = utils.generateCountValidator(false, 0, 256);
    let limit256Required = utils.generateCountValidator(true, 0, 256);
    this.rules = {
      // 应用名称
      appName: [{
          required: true,
          message: '请输入应用名称',
          trigger: 'blur'
        }, {
          validator: utils.generateValidator(true, true, 2, 30, true)
        }
      ],
      // 项目名称
      projectName: [{
        required: true,
        message: '请输入项目名称',
        trigger: 'blur'
      }, {
        validator(rule, values, callback){
          let passed = true;
          let reg = /^[A-Za-z0-9][A-Za-z0-9\-]{0,48}[A-Za-z0-9]$/;
          if (!values) {
            passed = false;
            callback('内容不能为空');
          } else if (values.length > 0) {
            if (!reg.exec(values)) {
              passed = false;
              callback('只能包含字母、数字、中划线，且不能以中划线为开头和结尾，2-50个字符');
            }
          }
          if (passed) {
            callback();
          }
        }
      }],
      //二级域名
      serviceName: [{
        required: false,
      }, {
        validator(rule, values, callback) {
          let reg = /^[a-z0-9][a-z0-9\\\\-]{0,48}[a-z0-9]$/;
          let passed = true;
          if (!values) {
            callback();
          } else if (values.length > 0) {
            if (!reg.exec(values)) {
              passed = false;
              callback('二级域名只能包含小写字母、数字、中划线，且不能以中划线为开头和结尾。长度2-50个字符');
            }
          }
          if (passed) {
            callback();
          }
         }
      }],
      // 健康检查
      // TODO:not used
      healthCheck: [{
        required: true,
        message: '请填写健康检查',
      }, {
        validator(rule, values, callback) {
          let passed = true;
          let reg = /^\/[A-Za-z0-9_\-\.\/]{1,99}$/;
          if (!reg.exec(values)) {
            passed = false;
            callback('以/开头，可以包含字母、数字、下划线、中划线。2-100个字符');
          }
          if (passed) {
            callback();
          }
        }
      }],
      // 文件存储
      fileLocation: [{
        type: 'array',
        required: false,
      }, {
        validator(rule, values, callback) {
          let passed = true;
          let reg = /^\/[A-Za-z0-9_\-\.@]{1,49}$/;
          for (let key in values) {
            let item = values[key];
            if (!reg.exec(item)) {
              passed = false;
              callback(`${item}不符合条件。请以/开头，可包含字母、数字、下划线、中划线，2-18位字符。`)
            }
          }
          if (passed) {
            callback();
          }
        }
      }],

      // 团队ID
      groupID: [{
        required: true,
        message: '请选择团队',
      }],
      scrumId: [{
        required: true,
        message: '请选择Scrum',
      }],
      lobId: [{
        required: true,
        message: '请选择Lob',
      }],
      // 运行环境, will be replaced
      profiles: [{
        type: 'array',
        required: true,
        message: '请选择至少一个运行环境',
        trigger: 'blur'
      }],
      // 运行环境
      profileNames: [{
        type: 'array',
        required: true,
        message: '请选择至少一个运行环境',
        trigger: 'blur'
      }],
      // 开发语言
      language: [{
        required: true,
        message: '请选择开发语言',
        trigger: 'change'
      }],
      // 语言版本
      languageVersion: [{
        required: true,
        message: '请选择开发语言版本',
      }],
      // 构建类型
      // packageType: [{
      //   required: true,
      //   message: '请选择构建类型',
      //   trigger: 'change'
      // }],

      serviceVersion: [{
        required: true,
        message: '版本号只能包含数字，不能超过五位',
      }],
      gitLabAddress: [{
        required: true,
        message: '请填写gitlab地址',
      }, {
        validator: basicValidator
      }, {
        validator: limit256Required
      }],
      // gitlab分支
      gitLabBranch: [{
        required: true,
        message: '请填写gitlab分支',
      }, {
        validator: basicValidator
      }, {
        validator: limit100Required
      }],
      // Gitlab父级pom.xml相对路径
      relativePathOfParentPOM: [{
        required: false,
      }, {
        validator: notRequriedBasicValidator
      }, {
        validator: limit256
      }],
      appMonitor: [{
        required: true
      }],
      vmOptions: [{
        required: false,
        message: '请填写VM_Options',
      }, {
        validator(rule, values, callback) {
          let passed = true;
          let reg = /^[^\u4e00-\u9fa5]{0,512}$/;
          if (!values.match(reg)) {
            passed = false;
            callback(`不能包含中文，不能超过512个字符`)
          }
          if (values.indexOf("\n") >= 0) {
            passed =false;
            callback(`不能回车换行`);
          }
          if (passed) {
            callback();
          }
        }
      }],
      mavenProfileId: [{
        required: false,
      }, {
        validator: notRequriedBasicValidator
      }, {
        validator: limit100
      }],

      // 镜像方式
      // imageType: [{
      //   required: true,
      //   message: '请选择打镜像方式',
      // }],
      // 镜像方式
      customImage: [{
        required: true,
        message: '请选择打镜像方式',
      }],
      // 镜像方式
      imageTypeID: [{
        required: true,
        message: '请选择打镜像方式',
      }],
      autoImageValue: [{
        required: false,
        message: '请输入镜像地址',
        trigger: 'change'
      }],
      customImageValue: [{
        required: true,
        message: '请选择镜像地址',
        trigger: 'change'
      }],
      // 镜像地址
      imageLocation: [{
          required: true,
          message: '请输入镜像地址',
        }
      ],
      cpu: [{
        required: true,
        message: '请选择CPU类型',
      }],
      memory: [{
        required: true,
        message: '请选择内存大小',
      }],
      cpuID: [{
        required: true,
        message: '请选择CPU类型',
      }],
      memoryID: [{
        required: true,
        message: '请选择内存大小',
      }],
      instanceCount: [{
        required: true,
        message: '请输入实例数量',
      }],
      expiredDays: [{
        required: true,
        message: '请输入过期时间',
      }],
      rollingUpdate: [{
        required: true,
        message: '请选择是否回滚',
      }],
      loadBalance: [{
        required: true,
        message: '请选择负载均衡方式',
      }],
      oneApm: [{
        required: true,
        message: '请选择是否使用oneApm',
      }],
      script4RollingUpdate: [{
        required: true,
        message: '请输入滚动升级脚本',
      }],
      maxAge4Script: [{
        required: true,
        message: '请输入超时时间',
      }],
      portMap: [{
        required: false,
        validator(rule, values, callback) {
          let passed = true;
          if (passed) {
            callback();
          }
        }
      }],
      agree: [{
        required: false,
      }, {
        validator(rule, values, callback) {
          if (values === false) {
            callback('请同意用户须知');
          } else {
            callback();
          }
        }
      }],
      //war包构建名称
      [`packageInfo.name`]: [{
        required: false,
      },{
        validator: notRequriedBasicValidator
      }, {
        validator: limit256
      }],
    }
  }

  getImageNameById(id) {
    let name = '未知';
    if (null == id) {
      return name;
    }
    if (id) {
      name = '自定义镜像';
    } else {
      name = '自动打镜像';
    }
    return name;
  }

  getImageInfo() {
    return [{
      id: false,
      name: '自动打镜像'
    }, {
      id: true,
      name: '自定义镜像'
    }]
  }
  // TODO: will move to storeHelper
  get appMonitorList() {
    return [{
      id: 0,
      name: '无监控'
    },
    //   {
    //   id: 1,
    //   name: 'OneAPM监控'
    // },
      {
      id: 2,
      name: '鹰眼监控'
    }]
  }
  // TODO: will move to storeHelper
  get defaultAppMonitorId() {
    return this.appMonitorList[0]['id'];
  }
  // TODO: will move to storeHelper
  getMonitorNameById(id) {
    var target = null;
    this.appMonitorList.some(it => {
      if (it.id === id) {
        target = it;
      }
      return target;
    });
    var result = '未设置';
    if (target && target.hasOwnProperty('name')) {
      result = target['name'];
    }
    return result
  }

  getRollingInfo() {
    return [{
      id: true,
      name: '需要'
    }, {
      id: false,
      name: '不需要'
    }]
  }

  getRollingName(id) {
    if (id) {
      return '需要';
    } else {
      return '不需要';
    }
  }

  getAllLoadBalance() {
    return ['Session_sticky', 'Round_robin', 'IP_HASH'].map(it => {
      return it.toUpperCase();
    })
  }
  getSupportedLoadBalance() {
    return ['Round_robin'].map(it => {
      return it.toUpperCase();
    })
  }

  get warningList() {
    return {
      'warning-app-monitor': {
        text: '内部测试中',
        more: '内部测试中，如部署出现问题，请尝试禁用鹰眼监控'
      },
      'warning-app-add-profile': {
        text: '',
        more: '应用创建时默认创建所有运行环境'
      }
    }
  }
}

const profileUtils = new AppInfoHelper();
export default profileUtils;