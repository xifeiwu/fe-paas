/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from './url';
import appInfoHelper from '../pages/profile/utils/app-props';

class Net {
  constructor() {
    this.SHOW_LOG = true;
    this.$utils = null;
    this.$storeHelper = null;
    this.requestingState = {
      getAPPList: false,
    }
  }

  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
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
   * get the message shown to user from error
   * @param error
   */
  getMsgFromErrorResponse(error) {
    let content = {
      title: '网络错误',
      msg: '请与管理员联系'
    };
    let response = null, data = null;
    if (error.hasOwnProperty('response')) {
      response = error.response;
      if (response.hasOwnProperty('data')) {
        data = response.data;
        if (data.hasOwnProperty('error') && data.hasOwnProperty('path')) {
          content.msg = data.error + ': ' + data.path;
        }
      }
    }
    return content;
  }

  /**
   * get the message to user from data
   * @param data
   * @returns {{success: boolean, msg: string}}
   */
  getResponseMsg(response) {
    let result = {
      success: false,
      title: '',
      msg: '失败'
    };
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        result.success = true;
        result.title = '';
        result.msg = '成功！';
      } else {
        result.success = false;
        result.title = '';
        result.msg = '失败！';
      }
      if (data.hasOwnProperty('msg') && data.msg && (data.msg.length > 0)) {
        result.msg = data.msg
      } else if (data.hasOwnProperty('content')) {
        result.msg = JSON.stringify(data.content);
      }
    }
    // console.log(result);
    return result;
  }

  login (response) {
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/profile/app',
          icon: 'my-icon-app'
          // icon: 'el-icon-location'
        },
        "服务管理": {
          router: '/profile/service',
          icon: 'my-icon-service'
        },
        "实例列表": {
          router: '/profile/instance',
          icon: 'my-icon-instance'
        },
        "外网域名": {
          router: '/profile/domain',
          icon: 'my-icon-domain',
        },
        "日志中心": {
          router: '/profile/log',
          icon: 'my-icon-log'
        },
        "应用监控": {
          router: '/profile/monitor',
          icon: 'my-icon-monitor'
        },
        "Oauth权限": {
          router: '/profile/oauth',
          icon: 'my-icon-oauth'
        },
        "审批管理": {
          router: '/profile/work-order',
          icon: 'my-icon-work-order'
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
      if ('data' in response && 'content' in response.data) {
        let content = response.data.content;
        let twoLevelMenu = [];
        let permission = content.permission;

        // append some property to each item
        permission = permission.map(it => {
          return updateItem(it);
        });

        // generate two level menu tree by parentId
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

        // generate one level menu from two level menu
        let oneLevelMenu = [];
        twoLevelMenu.forEach(it => {
          oneLevelMenu.push(it);
          if (it.hasOwnProperty('children')) {
            it.children.forEach(it2 => {
              oneLevelMenu.push(it2);
            })
          }
        });

        let menuToIgnore = ["应用监控", "Oauth权限"];
        // let menuToIgnore = ["应用监控"];
        oneLevelMenu = oneLevelMenu.filter(it => {
          return menuToIgnore.indexOf(it.name) === -1;
        }).map(it => {
          if (it.name === 'Oauth权限') {
            it.name = 'Access Key管理';
          }
          return it;
        });

        content.permission = oneLevelMenu;
        resolve(content);
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
        reject(this.getMsgFromErrorResponse(err));
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
   * resolve only when content data is ok.
   */
  getAPPList (options) {
    if (this.requestingState.getAPPList) {
      this.showLog('getAPPList', 'in the state of requesting');
      return new Promise((resolve, reject) => {
        reject('getAPPList is in requesting');
      })
    }
    let getAppModelList = function(appList) {
      let appModelList = [];
      appList.forEach(app => {
        appModelList.push({
          'appId': app.appId,
          'appName': app.appName,
          'profileNames':
            app.profileList ? app.profileList.filter(it => {
              return '' != it.name && '' != it.description
            }).map(it => {
              return it.name;
            }) : []
        })
      });
      return appModelList;
    };

    this.requestingState.getAPPList = true;
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_list, options).then(response => {
        this.requestingState.getAPPList = false;
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('appList') && Array.isArray(content.appList)) {
            let appList = content.appList;
            appList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              // utils.renameProperty(it, 'spaceList', 'profileList');
              it['profileNames'] = this.$utils.cloneDeep(it.spaceList);
              it['profileList'] = this.$storeHelper.getProfileInfoListByNameList(it.spaceList);
              if (it.hasOwnProperty('language')) {
                // whether the language of app is JAVA
                it['isJavaLanguage'] = it.hasOwnProperty('language') && 'JAVA' == it.language;
                it.languageLogo = null;
                switch (it.language) {
                  case 'JAVA':
                    it.languageLogo = 'java';
                    break;
                  case 'NODE_JS':
                    it.languageLogo = 'nodejs';
                    break;
                  case 'PYTHON':
                    it.languageLogo = 'python';
                }
              }
              // it.appName = it.tag;
              // it.serviceName = it.tag;
              if (it.hasOwnProperty('appName')) {
                it.serviceName = it.appName;
              } else {
                it.appName = it.serviceName;
              }
            });
            content.appModelList = getAppModelList(appList);
          }
          this.showLog('getAPPList', content);
          if (content) {
            resolve(content);
          }
        }
      }).catch(err => {
        this.requestingState.getAPPList = false;
        this.showLog('getAPPList', err);
        reject(err);
      });
    });
  }

  // only call when group id is changed
  getProfileListOfGroup(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_profile_of_group, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          this.showLog('getProfileListOfGroup', content);
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

  /**
   * 获取当前组的所有用户
   * @param options
   * @returns {Promise}
   */
  getUsersInGroup(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.users_in_group, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          this.showLog('getUsersInGroup', content);
          resolve(content);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 获取当前组的所有用户
   * @param options
   * @returns {Promise}
   */
  getUsersAll() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.users_all).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('userList')) {
          resolve(content.userList);
        } else {
          reject();
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
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
            reject({title: '创建应用失败', msg: data.msg});
          }
        }
      }).catch(err => {
        console.log(err);
        reject(this.getMsgFromErrorResponse(err));
      });
    });
  }

  createService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_create, options).then(response => {
        // console.log(response);
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
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
        reject(JSON.stringify(err));
      })
    });
  }

  // TODO: not used
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

  appUpdate(prop, options) {
    let urlList = {
      appName: URL_LIST.change_app_name,
      profileNames: URL_LIST.change_profile,
    };
    let url = urlList[prop];
    if (!url) {
      return new Promise((resolve, reject) => {
        reject('url not found');
      })
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
          oneApm: it.oneapm,
          healthCheck: it.healthCheck,
          environments: JSON.parse(JSON.stringify(it.environments)),
          hosts: JSON.parse(JSON.stringify(it.hosts)),
          cpuID: it.cpuInfo.id,
          memoryID: it.memoryInfo.id,
          // image: JSON.parse(JSON.stringify(it.image))
          customImage: it.image.customImage,
          imageLocation: it.image.location,
          rollingUpdate: it.rollingUpdate,
          loadBalance: it.loadBalance,
          gitLabAddress: it.gitLabAddress,
          gitLabBranch: it.gitLabBranch,
          mavenProfileId: it.mavenProfileId,
          fileLocation: it.fileLocation ? it.fileLocation : [],
          vmOptions: it.vmOptions
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
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');

              it.image = {
                customImage: null == it.customImage ? false : it.customImage,
                typeName: appInfoHelper.getImageNameById(it.customImage),
                location: it.image,
              };

              // cpu and memory from server is value, such as 2.0/4096
              // so get cpu and memory info by cpuAndMemoryInfo.
              let cpuAndMemoryInfo = appInfoHelper.getCPUAndMemoryInfoBySize(it.cpu, it.memory);
              it.cpuInfo = cpuAndMemoryInfo[0];
              it.memoryInfo = cpuAndMemoryInfo[1];

              if (!it.volume) {
                it.volume = '';
              }
              it.volume = it.volume.split(',').filter(it => {return it})
              this.$utils.renameProperty(it, 'volume', 'fileLocation');

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
        reject(err);
        console.log(err);
      })
    })
  }

  // 切换默认服务版本
  changeDefaultService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.change_default_service, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('切换默认服务版本失败');
      })
    });
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
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(JSON.stringify(err));
      })
    });
  }

  // stop service
  serviceStop(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_stop, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
      })
    });
  }

  serviceUpdate(prop, options) {
    let urlMap = {
      'healthCheck': URL_LIST.service_update_health,
      'image': URL_LIST.service_update_image,
      'gitLabAddress': URL_LIST.service_update_gitLab_address,
      'gitLabBranch': URL_LIST.service_update_gitLab_branch,
      'mavenProfileId': URL_LIST.service_update_maven_profile_id,
      'cpuAndMemory': URL_LIST.service_update_cpu_and_memory,
      'rollingUpdate': URL_LIST.service_update_rolling_update,
      'loadBalance': URL_LIST.service_update_load_balance,
      'fileLocation': URL_LIST.service_update_file_location,
      'environments': URL_LIST.service_update_environment,
      'hosts': URL_LIST.service_update_host,
      'oneApm': URL_LIST.service_update_one_apm,
      'vmOptions': URL_LIST.service_update_vm_options
    };
    let url = urlMap[prop];
    // console.log(url);
    if (!url) {
      return new Promise((resolve, reject) => {
        reject('url not found');
      });
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
            this.showLog('getServiceVersion', content);
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

  /**
   * 获取镜像列表相关信息
   * 1. autoImageList， 自动打镜像列表
   * 2. customEnvImageList, 自定义镜像-环境镜像列表
   * 3. privateAppList， 自定义镜像-私有镜像(项目列表)
   * @param options
   * @returns {Promise}
   */
  getImageRelatedInfo(options4Auto, options4Env, options4PrivateApp) {
    // 自动打镜像列表
    const getAutoImageList = () => {
      return axios.post(URL_LIST.auto_image_list, options4Auto);
    };
    // 自定义镜像-环境镜像
    const getCustomEnvImageList = () => {
      return axios.post(URL_LIST.custom_image_env_list, options4Env);
    };
    // 自定义镜像-私有镜像(项目列表)
    const getCustomPrivateImageAppList = () => {
      return axios.post(URL_LIST.custom_image_private_app_list, options4PrivateApp);
    };
    return new Promise((resolve, reject) => {
      axios.all([getAutoImageList(), getCustomEnvImageList(), getCustomPrivateImageAppList()])
        .then(axios.spread((autoImageList, customEnvImageList, privateAppList) => {
          autoImageList = this.getResponseContent(autoImageList);
          customEnvImageList = this.getResponseContent(customEnvImageList);
          privateAppList = this.getResponseContent(privateAppList);
          if (autoImageList && autoImageList.hasOwnProperty('basicImage')) {
            autoImageList = autoImageList['basicImage'];
          } else {
            reject('autoImageList not found');
          }
          if (customEnvImageList && customEnvImageList.hasOwnProperty('envImage')) {
            customEnvImageList = customEnvImageList['envImage'];
          } else {
            reject('customEnvImageList not found');
          }
          if (privateAppList && privateAppList.hasOwnProperty('projectName')) {
            privateAppList = privateAppList['projectName'];
          } else {
            reject('privateAppList not found');
          }
          resolve({autoImageList, customEnvImageList, privateAppList});
      })).catch(err => {
        console.log(err);
        reject(err);
      });
    })
  }

  /**
   * 自定义镜像-私有镜像(项目的版本列表)
   * @param options
   * @returns {Promise}
   */
  getVersionListOfAppInCustomImage(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.custom_image_private_version_list_of_app, options).then(response => {
        let versionList = this.getResponseContent(response);
        if (versionList.hasOwnProperty('customImage')) {
          resolve(versionList.customImage);
        } else {
          reject('not found versionList.customImage');
        }
      }).catch(err => {
        reject(err);
      })
    });
  }

  /**
   * 获取实例列表
   */
  getInstanceList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.instance_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content.hasOwnProperty('instanceList')) {
          let instanceList = content.instanceList;
          instanceList.forEach(it => {
            this.$utils.renameProperty(it, 'id', 'instanceName');
            this.$utils.renameProperty(it, 'state', 'status');
            this.$utils.renameProperty(it, 'ip', 'intranetIP');
            this.$utils.renameProperty(it, 'updated', 'createTime');
          });
        }
        this.showLog('getInstanceList', content);
        resolve(content);
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 获取一级域名列表
  // TODO: not used
  getDomainLevel1ListByProfile(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_level_1_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('domainList')) {
          resolve(content['domainList']);
          this.showLog('getDomainLevel1ListByProfile', content['domainList']);
        } else {
          reject('获取一级域名列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  // 获取当前组的所有一级域名
  getDomainLevel1Map(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_level_1_list_all, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('getDomainLevel1Map', content);
        } else {
          reject('获取一级域名列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 创建域名
  createDomain(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.create_domain, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('createDomain', content);
        } else {
          reject('添加域名失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  // 删除域名
  removeDomain(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.remove_domain, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('删除域名失败！');
      })
    })
  }
  // 获取域名列表
  getDomainList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('internetDomainList')) {
            let domainList = content['internetDomainList'];
            domainList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
            });
          }
          resolve(content);
          this.showLog('getDomainList', content);
        } else {
          reject('获取外网域名列表失败');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  // 为域名绑定服务
  domainBindService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_bind_service, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('domainBindService', content);
        } else {
          reject(null);
        }
      }).catch(err => {
        console.log(err);
        reject('为域名绑定服务失败！');
      })
    });
  }
  // 为域名解绑服务
  domainUnBindService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_unbind_service, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('domainUnBindService', content);
        } else {
          reject(null);
        }
      }).catch(err => {
      })
    });
  }

  // 白名单中添加IP
  addWhiteIP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_add_white_ip, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('白名单中添加IP失败');
      })
    });
  }
  // 修改IP
  updateWhiteIP(options, whiteIPID) {
    let url = URL_LIST.domain_update_white_ip + whiteIPID + '/update';
    return new Promise((resolve, reject) => {
      axios.put(url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('修改IP失败！');
      })
    });
  }
  // 删除IP
  deleteWhiteIP(whiteIPID) {
    let url = URL_LIST.domain_update_white_ip + whiteIPID + '/delete';
    return new Promise((resolve, reject) => {
      axios.delete(url).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('删除IP失败！');
      })
    });
  }
  // 获取白名单列表
  getWhiteIPList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_white_ip_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('getWhiteIPList', content);
        } else {
          reject(null);
        }
      }).catch(err => {
        console.log(err);
        reject('获取白名单列表');
      })
    });
  }
  //下载白名单模板
  downloadTemplateForWhiteIP() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.domain_download_white_ip_list_template).then(response => {
        resolve(response);
      }).catch(err => {
        console.log(err);
        reject('下载白名单模板失败！')
      })
    })
  }

  // 获取部署列表
  getDeployLogList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_deploy_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('deployLogList')) {
          content.deployLogList.forEach(it => {
            it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          });
          resolve(content.deployLogList);
          this.showLog('getDeployLogList', content.deployLogList);
        } else {
          reject('getDeployLogList, not found.')
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 获取运行日志
   */
  getHistoryRunLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_run_log, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('rows')) {
         resolve(content.rows);
         this.showLog('getHistoryRunLog', content.rows);
        } else {
          reject('获取日志内容失败');
        }
      }).catch(err => {
        console.log(err);
        reject('获取日志网络请求失败');
      })
    })
  }

  /**
   * 获取历史部署日志
    */
  getHistoryDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_deploy_log, options).then(response => {
        let content = this.getResponseContent(response);
        console.log(response);
        if (content && content.hasOwnProperty('deployLog')) {
          resolve(content.deployLog);
          // this.showLog('getHistoryDeployLog', content.deployLog);
        } else {
          reject('getHistoryDeployLog, not found deployLog');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  /**
   * 获取工单列表
   */
  getWorkOrderList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('workOrderDeployList') && Array.isArray(content.workOrderDeployList)) {
            content.workOrderDeployList.forEach(it => {
              if (it.hasOwnProperty('createTime')) {
               it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }
          resolve(content);
          this.showLog('getWorkOrderList', content);
        } else {
          reject('error: getWorkOrderToDoList');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  /**
   * 获取待办工单列表
   */
  getWorkOrderToDoList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_todo_list, options).then(response => {
        console.log(response);
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('todoWorkOrderList') && Array.isArray(content.todoWorkOrderList)) {
            content.todoWorkOrderList.forEach(it => {
              if (it.hasOwnProperty('createTime')) {
                it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }
          resolve(content);
          this.showLog('getWorkOrderToDoList', content);
        } else {
          reject('error: getWorkOrderToDoList');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 检查是否有正在处理的工单
   * @param options: {appId:, serviceVersion:}
   * @returns {Promise}
   */
  checkWorkOrderHandling(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_in_handling, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 获取工单详情
   */
  getWorkOrderDetail(options) {
    const getFeatureList = () => {
      return axios.post(URL_LIST.work_order_detail_feature_list, options);
    };
    const getAppList = () => {
      return axios.post(URL_LIST.work_order_detail_app_list, options);
    };
    const getUserToDo = () => {
      return axios.post(URL_LIST.work_order_detail_user_todo, options);
    };
    const getUserAccepted = () => {
      return axios.post(URL_LIST.work_order_detail_user_accepted, options);
    };
    const getUserNotify = () => {
      return axios.post(URL_LIST.work_order_detail_notify_user, options);
    }
    const getOperationList = () => {
      return axios.post(URL_LIST.work_order_detail_operation_list, options);
    };
    const getEmailGroup = () => {
      return axios.post(URL_LIST.work_order_detail_email_group, options)
    };
    let keyMap = {
      featureList: {
        functionType: {
          DEMAND: '需求',
          BUG: 'BUG'
        }
      },
      userAcceptedList: {
        status: {
          NO_HANDLE: '未处理',
          HANDLEING: '处理中',
          PASS: '通过'
        }
      },
      operationList: {
        functionType: {
          'WORKORDER_APPLY': '工单申请',
          'WAIT_TEST': '等待测试',
          'TESTING': '测试受理中',
          'HANDLEING': '处理中',
          'WAIT_DBA': '等待DBA处理',
          'DBAING': 'DBA受理中',
          'WAIT_DEPLOY': '等待部署',
          'DEPLOYING': '部署受理中',
          'WAIT_ACCEPTANCE': '等待验收',
          'ACCEPTANCEING': '验收受理中',
          'END': '结束',
        }
      }
    }
    const transfer = (key1, key2, key3) => {
      let formatted = key3;
      if (keyMap.hasOwnProperty(key1) && keyMap[key1].hasOwnProperty(key2) && keyMap[key1][key2].hasOwnProperty(key3)) {
        formatted = keyMap[key1][key2][key3];
      }
      return formatted;
    }
    return new Promise((resolve, reject) => {
      axios.all([getFeatureList(), getAppList(), getUserToDo(), getUserAccepted(),
        getUserNotify(), getOperationList(), getEmailGroup()])
        .then(axios.spread((featureList, appList, userToDo, userAcceptedList, notifyUserList, operationList, emailGroup) => {
          featureList = this.getResponseContent(featureList);
          appList = this.getResponseContent(appList);
          userToDo = this.getResponseContent(userToDo);
          userAcceptedList = this.getResponseContent(userAcceptedList);
          notifyUserList = this.getResponseContent(notifyUserList);
          operationList = this.getResponseContent(operationList);
          emailGroup = this.getResponseContent(emailGroup);
          if (featureList.hasOwnProperty('WorkOrderDeployFunctionVO')) {
            featureList = featureList.WorkOrderDeployFunctionVO;
            Array.isArray(featureList) && featureList.forEach(it => {
              if (it.hasOwnProperty('functionType')) {
                it.functionType = transfer('featureList', 'functionType', it.functionType);
              }
            });
          }
          if (appList.hasOwnProperty('WorkOrderDeployAppVO')) {
            appList = appList.WorkOrderDeployAppVO;
          }
          if (userToDo.hasOwnProperty('todoUser')) {
            userToDo = userToDo.todoUser;
          }
          if (userAcceptedList.hasOwnProperty('acceptanceUserList')) {
            userAcceptedList = userAcceptedList.acceptanceUserList;
            Array.isArray(userAcceptedList) && userAcceptedList.forEach(it => {
              if (it.hasOwnProperty('status')) {
                it.status = transfer('userAcceptedList', 'status', it.status);
              }
            });
          }
          if (notifyUserList.hasOwnProperty('informUserList')) {
            notifyUserList = notifyUserList['informUserList'];
          }
          if (operationList.hasOwnProperty('WorkOrderDeployLogVO')) {
            operationList = operationList.WorkOrderDeployLogVO;
            Array.isArray(operationList) && operationList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              if (it.hasOwnProperty('functionType')) {
                it.status = transfer('operationList', 'functionType', it.functionType);
              }
            });
          }
          if (emailGroup.hasOwnProperty('emailGroup')) {
            emailGroup = emailGroup['emailGroup'];
          }

          let results = {
            featureList: featureList,
            appList: appList,
            userToDo: userToDo,
            userAcceptedList: userAcceptedList,
            notifyUserList: notifyUserList,
            operationList: operationList,
            emailGroup: emailGroup
          };
          resolve(results);
        })).catch(err => {
          reject(err);
      })
    })
  }

  // 创建工单
  createWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_create, options).then(response => {
        // console.log(response);
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    })
  }

  // 修改工单
  modifyWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_modify, options).then(response => {
        console.log(response);
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    })
  }

  // 删除工单
  removeWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_remove, options).then(response => {
        // console.log(response);
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        reject('删除工单失败！')
      })
    })
  }

  // 工单-部署引用
  workOrderDeployApp(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_app_deploy, options).then(response => {
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

  // 工单-部署应用-拉取日志
  workOrderFetchDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_fetch_deploy_log, options).then(response => {
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

  checkBeforeHandleWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.check_before_handle_work_order, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('workOrderDeploy')) {
            resolve(content.workOrderDeploy);
          } else {
            reject('workOrderDeploy not found in content')
          }
        } else {
          let msg = this.getResponseMsg(response);
          if (!msg.success) {
            reject(msg.msg)
          }
        }
      });
    })
  }

  //处理工单
  handleWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_submit_handle, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('处理工单失败！');
      })
    })
  }

  getTerminalInfo(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.terminal_info, options).then(response => {
        console.log(response);
      });
    })
  }
}

export default new Net();