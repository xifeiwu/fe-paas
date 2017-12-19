import STORE from '../../../store';
import utils from '../../../utils';

class AppInfoHelper {
  constructor() {
    this.rules = {
      groupID: [{
        required: true,
        message: '请选择所属用户组',
        trigger: 'change'
      }],
        // 应用名称
        appName: [{
        required: true,
        message: '请输入应用名称',
        trigger: 'blur'
      },
        {
          min: 3,
          max: 30,
          message: '长度在3到30个字符',
          trigger: 'blur'
        }, {
          pattern: /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/,
          message: '只能包含字母、数字、下划线、中划线',
          trigger: 'blur'
        }
      ],
        // 项目名称
        projectName: [{
        required: true,
        message: '请输入项目名称',
        trigger: 'blur'
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
        // 健康检查
        healthCheck: [{
        required: true,
        pattern: /^\/[A-Za-z0-9_\-]+$/,
        message: '以/开头，可以包含字母数字下划线中划线',
      }, {
        min: 2,
        max: 50,
        message: '长度在2到50个字符',
      }],
        // gitlab地址
        gitlabAddress: [{
        required: true,
        message: '请填写gitlab地址',
      }],
        // gitlab分支
        gitlabBranch: [{
        required: true,
        message: '请填写gitlab分支',
      }],
        // Gitlab父级pom.xml相对路径
        relativePathOfParentPOM: [{
        required: false,
      }],


        // 镜像方式
        mirrorType: [{
        required: true,
        message: '请选择打镜像方式',
      }],
      // 镜像方式
      mirrorTypeID: [{
        required: true,
        message: '请选择打镜像方式',
      }],
        // 镜像地址
        mirrorLocation: [{
        required: false,
        message: '请输入镜像地址',

      }, {
        pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9_-]+$/,
        message: '只能包含中文，字母，数字',
        trigger: 'blur'
      }],
        // fileLocation: [{
        //   type: 'array',
        //   required: true,
        //   message: '请输入至少一个文件存储地址',
        // }, {
        //   pattern: /^\/[A-Za-z0-9_\-]+$/,
        //   message: '以/开头，可包含字母、数字、下划线、中划线，2-18位字符',
        //   trigger: 'blur'
        // }],
        fileLocation: [{
        type: 'array',
        required: true,
        message: '请输入至少一个文件存储地址',
      }, {
        validator(rule, values, callback) {
          console.log(rule);
          console.log(values);
          console.log(typeof(values));
          let passed = true;
          let reg = /^\/[A-Za-z0-9_\-]+$/;
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
    }
  }

  getMessageForCreateAPP(prop) {
    if (['cpuAndMemorylist', 'LanguageList'].indexOf(prop) > -1) {
      let messageForCreateAPP = STORE.getters['app/messageForCreateAPP'];
      if (!messageForCreateAPP) {
        utils.error('messageForCreateAPP not found', 'net.js');
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
      utils.error('profileListOfGroup not found', 'net.js');
      return null;
    }
    return profileListOfGroup;
  }

  getProfileByName(name) {
    let profileListOfGroup = this.getProfileMessage();
    let result = {
      name: '',
      description: ''
    };
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

  getCPUAndMemoryInfoBySize(cpuSize, memorySize) {
    let cpuAndMemorylist = this.getMessageForCreateAPP('cpuAndMemorylist');
    // console.log(cpuAndMemorylist);
    let model = [];
    for (let index in cpuAndMemorylist) {
      let item = cpuAndMemorylist[index];
      if (item.cpu == cpuSize) {
        model.push({
          id: item.id,
          cpu: item.cpu
        });
        let memoryList = item.memoryList;
        for (let index2 in memoryList) {
          let item = memoryList[index2];
          if (item.memory == memorySize) {
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

  getMirrorNameById(id) {
    let name = '未知';
    if (null == id) {
      return name;
    }
    id = parseInt(id);
    switch (id) {
      case 0:
        name = '自动打镜像';
        break;
      case 1:
        name = '自定义镜像';
        break;
    }
    return name;
  }

  getMirrorInfo() {
    return [{
      id: 0,
      name: '自动打镜像'
    }, {
      id: 1,
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
    return ['Round_robin', 'IP_hash', 'Session_sticky']
   }
}

export default new AppInfoHelper();
