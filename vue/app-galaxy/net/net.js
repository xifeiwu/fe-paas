/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from './url';
import utils from '../utils';
import appInfoHelper from '../pages/profile/utils/app_prop';

class Net {
  constructor() {
    this.SHOW_LOG = true;
    this.utils = utils;
  }

  showLog(func, data) {
    console.log(func + ' in net.js');
    console.log(data);
  }

  /**
   * get content from response
   * 1. if response if error, return null
   * 2. if response is ok, if content exist return content of response, else return empty object {}
   * @param response
   * @returns null, response err
   *          object, response ok
   */
  getResponseContent (response) {
    let content = null;
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        content = data.content ? data.content : {};
      } else {
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  }

  /**
   * get the message to user from data
   * @param data
   * @returns {{success: boolean, msg: string}}
   */
  getMsgForUserFromData(data) {
    let result = {
      success: false,
      msg: ''
    }
    if (0 === data.code) {
      result.success = true;
      result.msg = '成功！';
    } else {
      result.success = false;
      result.msg = '失败！';
    }
    if (data.hasOwnProperty('content')) {
      result.msg = JSON.stringify(data.content);
    } else if (data.hasOwnProperty('msg') && data.msg &&(data.msg.length > 0)) {
      result.msg = data.msg
    }
    console.log(result);
    return result;
  }

  login (res) {
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/profile/app',
          icon: 'el-icon-location'
        },
        "服务管理": {
          router: '/profile/service'
        },
        "实例列表": {
          router: '/profile/instance'
        },
        "外网域名": {
          router: '/profile/domain'
        },
        "日志中心": {
          router: '/profile/log_center'
        },
        "应用监控": {
          router: '/profile/app_monitor'
        },
        "Oauth权限": {
          router: '/profile/oauth_privilege',
          icon: 'el-icon-setting'
        },
        "审批管理": {
          router: '/profile/work-order'
        },
      }
      let key = item.name;
      if (keyMap.hasOwnProperty(key)) {
        let props = keyMap[key];
        for (let key in props) {
          item[key] = props[key];
        }
      }
      return item;
    }
    return new Promise((resolve, reject) => {
      if ('data' in res && 'content' in res.data) {
        let content = res.data.content;
        let twoLevelMenu = [];
        let permission = content.permission;
        permission = permission.map(it => {
          return updateItem(it);
        })
        permission.forEach(it => {
          if (0 === it.parentId) {
            twoLevelMenu.push(it);
          }
        });
        permission.forEach(it => {
          if (0 !== it.parentId) {
            let findParent = twoLevelMenu.some(pItem => {
              if (it.parentId === pItem.id) {
                if (!pItem.hasOwnProperty('children')) {
                  pItem.children = [];
                }
                pItem.children.push(it);
                return true;
              } else {
                return false;
              }
            });
            if (!findParent) {
              twoLevelMenu.push(it);
            }
          }
        });

        let oneLevelMenu = [];
        twoLevelMenu.forEach(it => {
          oneLevelMenu.push(it);
          if (it.hasOwnProperty('children')) {
            it.children.forEach(it2 => {
              oneLevelMenu.push(it2);
            })
          }
        });

        let results = oneLevelMenu;
        resolve(results);
      }
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.logout).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            let msg = null;
            if (data.hasOwnProperty('msg')) {
              msg = data.msg;
            }
            resolve(msg);
          }
        }
      }).catch(err => {
        reject(err);
      });
    })
  }

  getGroupList () {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_group_id).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            this.showLog('getGroupList', data.content)
            resolve(data.content);
          }
        }
      }).catch(err => {
        reject(err);
      });
    })
  }

  /**
   * 获得用户当前组的app列表
   * @param options
   * @returns {Promise}
   */
  getAPPList (options) {
    let getAppModelList = function(appList) {
      let appModelList = [];
      appList.forEach(app => {
        appModelList.push({
          'appId': app.appId,
          'profiles':
            app.profileList.filter(it => {
              return '' != it.name && '' != it.description
            }).map(it => {
              return it.name;
            }),
        })
      });
      return appModelList;
    };

    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('appList') && Array.isArray(content.appList)) {
            let appList = content.appList;
            appList.forEach(it => {
              it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              utils.renameProperty(it, 'spaceList', 'profileList');
              /**
               * change the format of profileList item from
               * dev to {
               *   name: 'dev',
               *   description: '开发环境'
               * }
               * as description should be shown in page app_manager
               */
              it['profileList'] = it['profileList'].filter(it => {
                // for the case profile not found in profile list of group
                return null != appInfoHelper.getProfileInfoByName(it);
              }).map(it => {
                return appInfoHelper.getProfileInfoByName(it);
              });
              // if the language of this app is JAVA
              it['isJavaLanguage'] = it.hasOwnProperty('language') && 'JAVA' == it.language
            });
            content.appModelList = getAppModelList(appList);
          }
          this.showLog('getAPPList', content);
          resolve(content);
        }
      }).catch(err => {
        this.showLog('getAPPList', err);
        reject(err);
      });
    });
  }

  getProfileListOfGroup(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_profile_of_group, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        }
      }).catch(err => {
      });
    });
  }

  /**
   * 获取创建APP时的相关信息
   * 1. 相关语言
   * 2. cpu memory对应关系
   */
  getMessageForCreateAPP () {
    function get1() {
      return axios.get(URL_LIST.get_cpu_and_memory_config);
    }
    function get2() {
      return axios.get(URL_LIST.get_all_language);
    }
    return new Promise((resolve, reject) => {
      axios.all([get1(), get2()]).then(axios.spread((cpu_and_memory, language) => {
        let cpuAndMemoryContent = this.getResponseContent(cpu_and_memory);
        let languageContent = this.getResponseContent(language);
        let content = null;
        if (cpuAndMemoryContent && languageContent) {
          content = Object.assign(cpuAndMemoryContent, languageContent);
        }
        if (content && content.hasOwnProperty('LanguageList')) {
          content.LanguageList.forEach(it => {
            let language = it.language;
            // add property type which will be send to server
            // change the style of language
            it.type = language;
            switch (language) {
              case 'JAVA':
                it.language = 'Java';
                break;
              case 'NODE_JS':
                it.language = 'NodeJS';
                break;
              case 'PYTHON':
                it.language = 'Python';
                break;
            }
            if (it.hasOwnProperty('languageVersionList')) {
              let languageVersionList = it['languageVersionList'];
              // console.log(languageVersionList);
              Array.isArray(languageVersionList) && languageVersionList.forEach(version => {
                // console.log(version.packageTypeList);
                version.packageTypeList = version.packageTypeList.map(packageType => {
                  return {
                    type: packageType,
                    packageType: packageType.replace('_', '.')
                  }
                });
              });
            }
          });
        }
        // console.log(content);
        //两个请求现已完成
        this.showLog('getMessageForCreateAPP', content);
        if (content) {
          resolve(content);
        } else {
          throw new Error('getMessageForCreateAPP fail');
        }
      })).catch(err => {
        this.showLog('getMessageForCreateAPP', err);
        reject(err);
      });

    })
  }

  createAPP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.create_app, options).then(response => {
        // let content = this.getResponseContent(response);
        // if (content) {
        //   resolve(content);
        // } else {
        //   reject('创建应用失败');
        // }
        let content = null;
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            content = data.content ? data.content : {};
            resolve(content);
          } else {
            reject(data.msg);
          }
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  }

  createService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_create, options).then(response => {
        console.log(response);
        let content = null;
        if ('data' in response) {
          let data = response.data;
          let result = this.getMsgForUserFromData(data);
          if (result.success) {
            resolve(result.msg);
          } else {
            reject(result.msg);
          }
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  }

  deleteAPP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.delete_app, options).then(response => {
        // console.log('in deleteAPP');
        let content = null;
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            content = data.content ? data.content : {};
            resolve(content);
          } else {
            reject(data.msg);
          }
        }
        // if (content) {
        //   resolve(content);
        // } else {
        //   reject('删除应用失败');
        // }
      }).catch(err => {
        reject(err);
      })
    });
  }

  changeProfile(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.change_profile, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let msg = data.msg ? data.msg : '修改成功';
            resolve(msg);
          } else {
            reject(data.msg);
          }
        }
      }).catch(err => {
        console.log(err);
      });
    });
  }

  /**
   * get service list by appID and profileID
   * @param options
   * @returns {Promise}
   */
  getServiceListByAppIDAndProfileID(options) {

    function getServiceModelList(items) {
      let modelList = [];
      Array.isArray(items) && items.forEach(it => {
        modelList.push({
          healthCheck: it.healthCheck,
          environments: JSON.parse(JSON.stringify(it.environments)),
          hosts: JSON.parse(JSON.stringify(it.hosts)),
          cpuID: it.cpu.id,
          memoryID: it.memory.id,
          // mirror: JSON.parse(JSON.stringify(it.mirror))
          mirrorTypeID: it.mirror.typeID,
          mirrorLocation: it.mirror.location,
          rollingUpdate: it.rollingUpdate,
          loadBalance: it.loadBalance,
          gitLabAddress: it.gitLabAddress,
          gitLabBranch: it.gitLabBranch,
          mavenProfileId: it.mavenProfileId,
          fileLocation: it.fileLocation,
        })
      });
      return modelList;
    }

    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_service_by_appId_and_profile, options).then(response => {
        let content = this.getResponseContent(response);
        // console.log(content);
        if (content) {
          if (content.hasOwnProperty('applicationServerList')) {
            let serviceList = content['applicationServerList'];
            Array.isArray(serviceList) && serviceList.forEach(it => {
              it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');

              it.mirror = {
                typeID: null == it.imageType ? null : parseInt(it.imageType),
                location: it.image,
                typeName: appInfoHelper.getMirrorNameById(it.imageType)
              };

              let cpuAndMemoryInfo = appInfoHelper.getCPUAndMemoryInfoBySize(it.cpu, it.memory);
              it.cpu = cpuAndMemoryInfo[0];
              it.memory = cpuAndMemoryInfo[1];

              utils.renameProperty(it, 'volumes', 'fileLocation');

              // ['mavenProfileId', 'healthCheck', 'loadBalance', 'relativePath'].forEach(prop => {
              //   if (it.hasOwnProperty(prop) && !it[prop]) {
              //     it[prop] = '未设置';
              //   }
              // })
            });
            content.serviceModelList = getServiceModelList(serviceList);
          }
          this.showLog('getServiceListByAppIDAndProfileID', content);
          resolve(content);
        } else {
          reject('获取服务列表信息失败');
        }
      }).catch(err => {
        console.log(err);
      })
    })
  }

  serviceDeploy(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_deploy, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let content = data.content ? data.content : {};
            resolve(content);
          } else {
            reject(data.msg);
          }
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
    });
  }
  serviceDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_deploy_log, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          reject();
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
    });
  }

  serviceDelete(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_delete, options).then(response => {
        console.log(response);
        resolve(response);
      }).catch(err => {
        console.log(err);
      })
    });
  }

  serviceUpdate(prop, options) {
    let url = null;
    switch (prop) {
      case 'healthCheck':
        url = URL_LIST.service_update_health;
        break;
    }
    if (null == url) {
      return;
    }
    return new Promise((resolve, reject) => {
      axios.post(url, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let msg = data.msg ? data.msg : '修改成功';
            resolve(msg);
          } else {
            reject(data.msg);
          }
        }
      }).catch(err => {
        console.log(err);
      })
    })
  }

  /**
   * 获取服务版本号列表
   * @param options {appId, profileId}
   * @returns {Promise}
   */
  getServiceVersion(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_version, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let content = data.content ? data.content : {};
            resolve(content);
          } else {
            reject(data.msg);
          }
        }
        // resolve(response);
      }).catch(err => {
        reject(err);
      })
    })
  }

  // 获取实例列表
  getInstanceList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.instance_list, options).then(response => {
        console.log(response);
      }).catch(err => {
        console.log(err);
      })
    })
  }
}

export default new Net();