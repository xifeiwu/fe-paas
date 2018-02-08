import STORE from '../../../store';

class AppInfoHelper {
  generateReg(chinese, min, max) {
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
    let regStr = `^[${chineseState['reg']}A-Za-z0-9_\\-\\.@]{${min},${max}}$`;
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
  generateValidator(required, chinese, min, max) {
    let regStates = this.generateReg(chinese, min, max);
    return function(rule, values, callback) {
      values = values.trim();
      let passed = true;
      let reg = regStates.reg;
      if (values.length > 0) {
        if (!reg.exec(values)) {
          passed = false;
          callback(regStates.desc);
        }
      } else {
        if (required) {
          passed = false;
          callback('内容不能为空');
        }
      }
      if (passed) {
        callback();
      }
    };
  }
  constructor() {
    let basicValidator = this.generateValidator(true, true);
    let notRequriedBasicValidator = this.generateValidator(false, true);
    this.rules = {
      // 应用名称
      appName: [{
          required: true,
          message: '请输入应用名称',
          trigger: 'blur'
        }, {
          validator: this.generateValidator(true, true, 3, 30)
        }
      ],
      // 项目名称
      projectName: [{
        required: true,
        message: '请输入项目名称',
        trigger: 'blur'
      }, {
        validator: basicValidator
      }],
      // 健康检查
      healthCheck: [{
        required: true,
        message: '请填写健康检查',
      }, {
        validator(rule, values, callback) {
          let passed = true;
          let reg = /^\/[A-Za-z0-9_\-\.@]{2,50}$/;
          if (!reg.exec(values)) {
            passed = false;
            callback('以/开头，可以包含字母、数字、下划线、中划线。2-50个字符');
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
          let reg = /^\/[A-Za-z0-9_\-\.@]{2,18}$/;
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
      // 运行环境
      profiles: [{
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
      buildType: [{
        required: true,
        message: '请选择构建类型',
        trigger: 'change'
      }],

      serviceVersion: [{
        required: true,
        message: '请填写服务版本，只能包含数字',
        pattern: /^[0-9]+$/,
      }],
      gitLabAddress: [{
        required: true,
        message: '请填写gitlab地址',
      }, {
        validator: basicValidator
      }],
      // gitlab分支
      gitLabBranch: [{
        required: true,
        message: '请填写gitlab分支',
      }, {validator: basicValidator}],
      // Gitlab父级pom.xml相对路径
      relativePathOfParentPOM: [{
        required: false,
      }, {
        validator: notRequriedBasicValidator
      }],
      vmOptions: [{
        required: false,
      }, {
        validator: notRequriedBasicValidator
      }],
      mavenProfileId: [{
        required: false,
      }, {
        validator: notRequriedBasicValidator
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
      }],
      customImageValue: [{
        required: true,
        message: '请输入镜像地址',
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
      count: [{
        type: 'string',
        required: true,
        message: '请输入实例数量',
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
    }
  }

  getMessageForCreateAPP(prop) {
    if (['cpuAndMemorylist', 'LanguageList'].indexOf(prop) > -1) {
      let messageForCreateAPP = STORE.getters['app/messageForCreateAPP'];
      if (!messageForCreateAPP) {
        return null;
      }
      return messageForCreateAPP[prop];
    } else {
      return null;
    }
  }

  getProfileMessage() {
    let profileListOfGroup = STORE.getters['user/profileListOfGroup'];
    if (!profileListOfGroup) {
      return null;
    }
    return profileListOfGroup;
  }

  getProfileInfoByName(name) {
    let profileListOfGroup = this.getProfileMessage();
    let result = null;
    if (Array.isArray(profileListOfGroup)) {
      for (let key in profileListOfGroup) {
        let item = profileListOfGroup[key];
        if (name == item.name) {
          result = item;
          break;
        }
      }
    }
    return result;
  }

  getProfileInfoByID(id) {
    let profileListOfGroup = this.getProfileMessage();
    let result = null;
    if (Array.isArray(profileListOfGroup)) {
      for (let key in profileListOfGroup) {
        let item = profileListOfGroup[key];
        if (id == item.id) {
          result = item;
          break;
        }
      }
    }
    return result;
  }

  getCPUAndMemoryInfoBySize(cpuSize, memorySize) {
    let model = [];
    let cpuAndMemorylist = this.getMessageForCreateAPP('cpuAndMemorylist');
    if (!cpuAndMemorylist || !Array.isArray(cpuAndMemorylist)) {
      return model;
    }
    // console.log(cpuAndMemorylist);
    memorySize = parseInt(memorySize);
    if (memorySize > 1024) {
      memorySize /= 1024;
    }
    for (let index in cpuAndMemorylist) {
      let item = cpuAndMemorylist[index];
      if (item.cpu == cpuSize) {
        model.push({
          id: item.id,
          size: item.cpu
        });
        let memoryList = item.memoryList;
        for (let index2 in memoryList) {
          let item = memoryList[index2];
          if (item.memory == memorySize) {
            model.push({
              id: item.id,
              size: item.memory
            });
            break;
          }
        }
        break;
      }
    }
    // deal with the case cpuID or memoryID not found
    if (model.length != 2 && cpuAndMemorylist.length > 0) {
      model = [];
      let defaultConfig = cpuAndMemorylist[0];
      model.push({
        id: defaultConfig.id,
        size: cpuSize
        // size: defaultConfig.cpu
      });
      let memoryList = defaultConfig.memoryList;
      for (let index in memoryList) {
        let item = memoryList[index];
        if (1 == item.defaultSelect) {
          model.push({
            id: item.id,
            // size: item.memory
            size: memorySize
          });
        }
      }
    }
    return model;
  }

  getCPUAndMemoryInfoByID(cpuID, memoryID) {
    let cpuAndMemorylist = this.getMessageForCreateAPP('cpuAndMemorylist');
    let model = [];
    for (let index in cpuAndMemorylist) {
      let item = cpuAndMemorylist[index];
      if (item.id == cpuID) {
        model.push({
          id: item.id,
          cpu: item.cpu
        });
        let memoryList = item.memoryList;
        for (let index2 in memoryList) {
          let item = memoryList[index2];
          if (item.id == memoryID) {
            model.push({
              id: item.id,
              memory: item.memory
            });
            break;
          }
        }
        break;
      }
    }
    return model;
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
    return ['Round_robin', 'Session_sticky'].map(it => {
      return it.toUpperCase();
    })
  }

  /** map key from local to server, used for add app and add service
   * @param origin
   */
  changePropNameForServer(origin) {
    let preTreat = function(item) {
      if (item.hasOwnProperty('serviceVersion')) {
        item['serviceVersion'] = 'v' + item['serviceVersion'];
      }
      return item;
    };
    let keyMap = {
      instanceCount: 'instanceNum',
      // appName: 'tag',
      // projectName: 'serviceName',
      appName: 'serviceName',
      projectName: 'tag',
      profiles: 'spaceList',
      buildType: 'packageType',
      imageType: 'customImage',
      imageLocation: 'image',
      fileLocation: 'volumes',
      groupID: 'groupId',
      cpuID: 'cpuId',
      memoryID: 'memoryId',
      relativePathOfParentPOM: 'relativePath',
      // gitlabAddress: 'gitLabAddress',
      // gitlabBranch: 'gitLabBranch',
    };
    let updateProp = function(item) {
      if ('object' === typeof(item)) {
        for (let key in item) {
          if (keyMap.hasOwnProperty(key)) {
            item[keyMap[key]] = item[key];
            delete item[key];
          }
        }
      } else if (Array.isArray(item)) {
        item.forEach(updateProp);
      }
    };

    let copy = JSON.parse(JSON.stringify(origin));
    copy = preTreat(copy);
    updateProp(copy);
    return copy;
  }
}

export default new AppInfoHelper();