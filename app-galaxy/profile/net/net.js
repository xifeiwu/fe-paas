/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import {URL_LIST} from './url';
import appInfoHelper from '../pages/profile/utils/app-props';
import NetBase from '$assets/js/net';
var debug = browserDebug('pass-fe:net');

function permission(target, name, descriptor) {
  let value = descriptor.value;
  Object.assign(descriptor, {
    value: function (...args) {
      // console.log(this.__proto__ === target);
      value.apply(this, args);
    }
  })
}

class Net extends NetBase {
  constructor() {
    super();
    this.SHOW_LOG = true;
    this.$utils = null;
    this.$storeHelper = null;
    this.requestingState = {
      getAPPList: false,
    };
  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }

  showLog(func, data) {
    debug('%s, %o', func, data);
  }

  // 获取用户不允许操作的功能列表
  getNotPermittedCommands() {
    return new Promise((resolve, reject) => {
      axios.all([
        axios.post(URL_LIST.permission_url_map.url, {}),
        axios.get(URL_LIST.user_not_permitted.url)
      ]).then(axios.spread((permissionMapRes, notPermittedRes) => {
        let permissionMapListOrigin = this.getResponseContent2(permissionMapRes);
        let notPermittedListOrigin = this.getResponseContent2(notPermittedRes);
        notPermittedListOrigin = notPermittedListOrigin.map(it => {
          it.hasOwnProperty('id') && delete it.id;
          it.hasOwnProperty('parentId') && delete it.parentId;
          it.hasOwnProperty('createTime') && delete it.createTime;
          it.hasOwnProperty('updateTime') && delete it.updateTime;
          it.hasOwnProperty('permissionType') && delete it.permissionType;
          return it;
        });
        // console.log(permissionMapListOrigin);
        // console.log(notPermittedListOrigin);
        let notPermittedList = [];

        // some permissionPath do not related to any url are list bellow
        let pathToKey = {
          '/2.x/internet/ipWhiteList': 'domain_bind_white_list',
          // 应用监控
          '/2.x/apm': 'app_monitor',
          // 应用转让
          '/2.x/app/transfer': 'app_transfer',
          // 更改服务信息
          '/2.x/service/update': 'service_update',
          // 查看实例监控
          '/2.x/instances/apm': 'instance_monitor',
          // 查看部署日志
          // '/2.x/service/search/deployLog': '',
          // 删除域名
          '/2.x/internet/delete': 'domain_remove',
          // 从实例列表打开终端
          '/2.x/instances/openTerminal': 'open_terminal_from_instance',
          // 从实例列表打开监控
          '	/2.x/instances/apm': '',
          // 服务管理页面
          '/2.x/service': '/service',
          // 实例列表页面
          '/2.x/instances': '/instance',
          // 外网域名页面
          '/2.x/internet': '/domain',
          // 页面-日志中心
          '/2.x/logs': '/log',
          // 页面-查看运行日志
          '/2.x/logs/searchLog': '/log/run',
          // 页面-查看部署日志
          '/2.x/logs/searchDeployLog': '/log/deploy',
          // 页面-Oauth权限
          '/2.x/keys': '/oauth',
          // 页面-Oauth/Access Key
          '/2.x/keys/AccessKey': '/oauth/key',
          // 页面-Oauth/url
          '/2.x/keys/authUrl': '/oauth/url',
          // 页面-审批管理页面
          '/2.x/orders': '/work-order',
          // 页面-审批管理/待办工单
          '/2.x/order/todoList': '/work-order/todo',
          // 页面-审批管理/工单列表
          '/2.x/order/list': '/work-order/list',

          // 跳转逻辑
          '/2.x/service/update/DefaultInternetDomain': 'go-domain-from-service-global',
          '/2.x/service/bindingInternetDomain': 'go-domain-from-service',
          // 查看运营日志
          '/2.x/instances/searchLogs': 'go-log-run-from-instance',
          // 查看监控
          '/2.x/instances/apm': 'go-monitor-from-instance',
        };
        // format of item in notPermittedList
        // {
        //   id: 110,
        //   name: "创建外网域名",
        //   parentId: 84,
        //   path: "/2.x/internet/create",
        //   permissionType: "BUTTON",
        //   url: "/domain/record/create",
        //   method: "POST",
        //   key: "domain_bind_white_list"
        // }

        // add url and method by notPermittedListOrigin
        notPermittedListOrigin.forEach(it => {
          // check if permission in pathToKey first
          if (pathToKey.hasOwnProperty(it.path)) {
            it.key = pathToKey[it.path];
            notPermittedList.push(it);
          } else {
            permissionMapListOrigin.forEach(it2 => {
              if (it.path === it2['permissionPath']) {
                notPermittedList.push(Object.assign({}, it, {url: it2.url, method: it2.method}));
              }
            });
          }
        });
        // console.log(notPermittedList);

        // add key by URL_LIST
        for (let key in URL_LIST) {
          let item = URL_LIST[key];
          if (!this.$utils.isObject(item)) {
            continue;
          }
          if (!item.hasOwnProperty('path')) {
            continue;
          }
          notPermittedList.forEach(it => {
            if (it.url === item['path']) {
              // if item has property 'method', it must be the same as item in notPermittedList before add
              if (item.hasOwnProperty('method') && it.hasOwnProperty('method')) {
                if (item.method.toLowerCase() == it.method.toLowerCase()) {
                  it['key'] = key;
                }
              } else {
                it['key'] = key;
              }
            }
          })
        }

        let result = notPermittedList.filter(it => {
          return it.hasOwnProperty('key') && it.key;
        }).map(it => {
          return it['key'];
        });

        // console.log(notPermittedList);
        // console.log(result);
        resolve(result);
      })).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.user_not_permitted.path}；${err.toString()}`
        });
      })
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.logout.url).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            let msg = null;
            if (data.hasOwnProperty('msg')) {
              msg = data.msg;
            }
            resolve(msg);
          } else {
            reject({
              title: '退出失败',
              msg: '服务器错误！'
            });
          }
        } else {
          reject({
            title: '退出失败',
            msg: '服务器错误！'
          });
        }
      }).catch(err => {
        reject(this.getMsgFromErrorResponse(err));
      });
    })
  }

  /**
   * 获取用户所在的组列表
   * @returns {Promise}
   */
  getUserGroupList () {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_user_group_list.url).then(response => {
        let responseContent = this.getResponseContent(response);
        if (responseContent) {
          if (responseContent.hasOwnProperty('groupList') && Array.isArray(responseContent['groupList'])) {
            responseContent.groupList = responseContent.groupList.map(it => {
              let lobName = '';
              if (it.hasOwnProperty('lobName') && it.lobName && it.lobName.length > 0) {
                lobName = '（' + it['lobName'] + '）';
              }
              it.asLabel = it.name;
              // it.asLabel = it.name + lobName;
              return it;
            })
          }
          resolve(responseContent);
        } else {
          console.log('用户组列表获取失败！');
          reject({
            title: '数据格式不正确',
            msg: '用户组列表获取失败！'
          })
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.get_user_group_list.path}；${err.toString()}`
        });
      });
    })
  }

  // 获取Scrum列表
  getLobInfo() {
    return new Promise((resolve, reject) => {
      axios.all([
        axios.get(URL_LIST.get_scrum_list.url),
        axios.get(URL_LIST.get_lob_list.url)
      ]).then(axios.spread((res1, res2) => {
        let content1 = this.getResponseContent(res1);
        let content2 = this.getResponseContent(res2);
        let scrumList = [], lobList = [];
        if (content1 && content1.hasOwnProperty('scrumList')) {
          scrumList = content1['scrumList']
        }
        if (content2 && content2.hasOwnProperty('lobList')) {
          lobList = content2['lobList']
        }
        // console.log(scrumList);
        // console.log(lobList);
        resolve({
          scrumList, lobList
        });
      })).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.get_scrum_list.path}；${err.toString()}`
        });
      })
    });
  }

  /**
   * 获取所有组列表
   * @returns {Promise}
   */
  getAllGroupList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_all_group_list.url).then(res => {
        let resContent = this.getResponseContent(res);
        if (resContent) {
          resolve(resContent);
        } else {
          reject('获取组列表信息失败！');
        }
      }).catch(err => {
        console.log(err);
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
    // console.log(`options: ${JSON.stringify(options)}`);
    if (this.requestingState.getAPPList || !options.groupId) {
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
      axios.post(URL_LIST.app_list.url, options).then(response => {
        this.requestingState.getAPPList = false;
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('appList') && Array.isArray(content.appList)) {
            let appList = content.appList;
            appList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              if (it.createTime) {
                it.createTime = it.createTime.split(' ');
              }
              // utils.renameProperty(it, 'spaceList', 'profileList');
              // rename spaceList to profileNames
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
              // if (it.hasOwnProperty('appName')) {
              //   it.serviceName = it.appName;
              // } else {
              //   it.appName = it.serviceName;
              // }
            });
            content.appModelList = getAppModelList(appList);
          }
          this.showLog('getAPPList', content);
          if (content) {
            resolve(content);
          }
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '获取应用列表失败！'
            })
          }
        }
      }).catch(err => {
        this.requestingState.getAPPList = false;
        // console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.app_list.path}；${err.toString()}`
        });
      });
    });
  }

  /**
   * 通过groupId获取该group的所有App列表
   * @param options
   * @returns {Promise}
   */
  getAppListByGroupID(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_list.url, options).then(response => {
        let resContent = this.getResponseContent(response);
        if (resContent) {
          resolve(resContent);
        } else {
          reject('获取组列表失败！');
        }
      }).catch(err => {
        reject(err);
      })
    });
  }

  // only call when group id is changed
  getProfileListOfGroup(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_profile_of_group.url, options).then(response => {
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
      return axios.get(URL_LIST.get_cpu_and_memory_config.url);
    }
    function get2() {
      return axios.get(URL_LIST.get_all_language.url);
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
      axios.post(URL_LIST.users_in_group.url, options).then(response => {
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
      axios.get(URL_LIST.users_all.url).then(response => {
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
      axios.post(URL_LIST.app_create.url, options).then(response => {
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
      axios.post(URL_LIST.service_create.url, options).then(response => {
        // console.log(response);
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject({
            title: '创建失败',
            msg: result.msg
          });
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.service_create.path}；${err.toString()}`
        });
      });
    });
  }

  deleteAPP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_delete.url, options).then(response => {
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

  /**
   * 修改应用名称/运行环境
   * @param prop
   * @param options
   * @returns {Promise}
   */
  appUpdate(prop, options) {
    let urlMap = {
      appName: URL_LIST.app_change_name,
      profileNames: URL_LIST.app_change_profile,
    };
    let urlDesc = urlMap[prop];
    if (!urlDesc) {
      return new Promise((resolve, reject) => {
        reject('url not found');
      })
    }
    return new Promise((resolve, reject) => {
      axios.post(urlDesc.url, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let msg = data.msg ? data.msg : '修改成功';
            resolve(msg);
          } else {
            reject({
              title: '修改失败',
              msg: data.msg
            });
          }
        }
      }).catch(err => {
        // console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${urlDesc.path}；${err.toString()}`
        });
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
      axios.post(URL_LIST.get_service_by_appId_and_profile.url, options).then(response => {
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

              // fix运行实例/总实例数
              if (it.hasOwnProperty('containerStatus') && it['containerStatus']) {
                let containerStatus = it['containerStatus'];
                it.applicationServiceStatus = `${containerStatus.Running}/${containerStatus.Total}`;
              }

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
          reject({
            title: '获取服务列表信息失败',
            msg: '请联系管理员'
          });
        }
      }).catch(err => {
        // console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.get_service_by_appId_and_profile.path}；${err.toString()}`
        });
      })
    })
  }

  // 切换默认服务版本
  changeDefaultService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_change_default.url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.service_change_default.path}；${err.toString()}`
        });
      })
    });
  }

  serviceDeploy(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_deploy.url, options).then(response => {
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
  // 获取部署日志（轮询）
  serviceGetDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_get_deploy_log.url, options).then(response => {
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
      axios.post(URL_LIST.service_delete.url, options).then(response => {
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
      axios.post(URL_LIST.service_stop.url, options).then(response => {
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
      'healthCheck': URL_LIST.service_update_health.url,
      'image': URL_LIST.service_update_image.url,
      'gitLabAddress': URL_LIST.service_update_gitLab_address.url,
      'gitLabBranch': URL_LIST.service_update_gitLab_branch.url,
      'mavenProfileId': URL_LIST.service_update_maven_profile_id.url,
      'cpuAndMemory': URL_LIST.service_update_cpu_and_memory.url,
      'rollingUpdate': URL_LIST.service_update_rolling_update.url,
      'loadBalance': URL_LIST.service_update_load_balance.url,
      'fileLocation': URL_LIST.service_update_file_location.url,
      'environments': URL_LIST.service_update_environment.url,
      'hosts': URL_LIST.service_update_host.url,
      'oneApm': URL_LIST.service_update_one_apm.url,
      'vmOptions': URL_LIST.service_update_vm_options.url
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
      axios.post(URL_LIST.service_version.url, options).then(response => {
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
      return axios.post(URL_LIST.auto_image_list.url, options4Auto);
    };
    // 自定义镜像-环境镜像
    const getCustomEnvImageList = () => {
      return axios.post(URL_LIST.custom_image_env_list.url, options4Env);
    };
    // 自定义镜像-私有镜像(项目列表)
    const getCustomPrivateImageAppList = () => {
      return axios.post(URL_LIST.custom_image_private_app_list.url, options4PrivateApp);
    };
    return new Promise((resolve, reject) => {
      axios.all([getAutoImageList()])
        .then(axios.spread((autoImageList, customEnvImageList, privateAppList) => {
          autoImageList = this.getResponseContent(autoImageList);
          if (autoImageList && autoImageList.hasOwnProperty('basicImage')) {
            autoImageList = autoImageList['basicImage'];
          } else {
            reject('autoImageList not found');
          }
          // customEnvImageList = this.getResponseContent(customEnvImageList);
          // if (customEnvImageList && customEnvImageList.hasOwnProperty('envImage')) {
          //   customEnvImageList = customEnvImageList['envImage'];
          // } else {
          //   reject('customEnvImageList not found');
          // }
          // privateAppList = this.getResponseContent(privateAppList);
          // if (privateAppList && privateAppList.hasOwnProperty('projectName')) {
          //   privateAppList = privateAppList['projectName'];
          // } else {
          //   reject('privateAppList not found');
          // }
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
      axios.post(URL_LIST.custom_image_private_version_list_of_app.url, options).then(response => {
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
      axios.post(URL_LIST.instance_list.url, options).then(response => {
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
  // 更改实例数量
  instanceChangeCount(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.instance_change_count.url, options).then(response => {
        // let content = this.getResponseContent(response);
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('网络请求失败！');
      })
    })
  }

  // 获取一级域名列表
  // TODO: not used
  getDomainLevel1ListByProfile(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_level_1_list.url, options).then(response => {
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
      axios.post(URL_LIST.domain_level_1_list_all.url, options).then(response => {
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (Object.keys(resContent).length > 0) {
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '一级域名列表为空'
            });
          }
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '获取一级域名列表失败！',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_level_1_list_all.path}；${err.toString()}`
        });
      })
    })
  }

  // 创建域名
  createDomain(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_add.url, options).then(response => {
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
      axios.post(URL_LIST.domain_remove.url, options).then(response => {
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
      axios.post(URL_LIST.domain_list.url, options).then(response => {
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (resContent.hasOwnProperty('internetDomainList')) {
            let domainList = resContent['internetDomainList'];
            domainList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
            });
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '未找到internetDomainList'
            })
          }
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '获取外网域名列表失败',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_list.path}；${err.toString()}`
        });
      })
    })
  }
  // 为域名绑定服务
  domainBindService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_bind_service.url, options).then(response => {
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
      axios.post(URL_LIST.domain_unbind_service.url, options).then(response => {
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
      axios.post(URL_LIST.domain_add_white_ip.url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '添加白名单成功！';
          }
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
    let url = URL_LIST.domain_update_white_ip.url + whiteIPID + '/update';
    return new Promise((resolve, reject) => {
      axios.put(url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '修改白名单成功！';
          }
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
    let url = URL_LIST.domain_update_white_ip.url + whiteIPID + '/delete';
    return new Promise((resolve, reject) => {
      axios.delete(url).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '删除成功！';
          }
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
      axios.post(URL_LIST.domain_white_ip_list.url, options).then(response => {
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
      axios.get(URL_LIST.domain_download_white_ip_list_template.url).then(response => {
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
      axios.post(URL_LIST.log_deploy_list.url, options).then(response => {
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
      axios.post(URL_LIST.log_run_log.url, options).then(response => {
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
      axios.post(URL_LIST.log_deploy_log.url, options).then(response => {
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
   * oauth相关
   */
  // 获取绑定
  oAuthGetTargetGroupList(options) {
    let url = `${URL_LIST.oauth_get_target_group_list.url}?requestGroupId=${options.requestGroupId}`;
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('targetGroupList')) {
          resolve(content['targetGroupList']);
        } else {
          reject('oAuthGetTargetGroupList, not found content');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 创建Access Key
  oAuthCreateAccessKey(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_create_access_key.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          reject('oAuthCreateAccessKey, not found content');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }


  // 通过应用和运行环境获取AccessKey列表
  oAuthGetAccessKeyListByApp(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_access_key_list_by_app.url, options).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '获取AccessKey列表失败',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_access_key_list_by_app.path}；${err.toString()}`
        })
      })
    });
  }

  // 获取Access Key列表
  getAccessKeyList(options) {
    /**
     * transfer name of props
     * 我的应哟：requestApplicationName -> myApp
     * Access Key: clientId -> accessKey
     * produceEnv -> profileName
     * @param it
     */
    let transfer = function(it) {
      it.accessKey = it.clientId;
      it.myApp = it['applicationName'] ? it['applicationName'] : '未配置';
      // 访问应用状态信息
      it.appAccessStatus = '';
      if (null == it.produceEnv) {
        it.profileName = null;
      } else {
        if (true == it.produceEnv) {
          it.profileName = '生产环境';
        } else if (false == it.produceEnv) {
          it.profileName = '非生产环境';
        }
      }
      it.production = it.produceEnv;
      it.accessConfigList = it['requestApplicationInfoVOList'];
      if (it.accessConfigList.length > 0) {
        it.accessConfigDesc = it.accessConfigList.map(it => {
          return `${it.targetGroupName} - ${it.targetApplicationName}，${it.status}`;
        });
      } else {
        it.accessConfigDesc = [];
      }
      it.createTime =  this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
      if (it.createTime) {
        it.createTime = it.createTime.split(' ');
      }
    };
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_get_access_key_list.url, options).then(response => {
        // console.log(response);
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (resContent.hasOwnProperty('uaaList')) {
            let uaaList = resContent['uaaList'];
            if (Array.isArray(uaaList)) {
              uaaList.forEach(transfer.bind(this));
            }
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '未找到uaaList'
            });
          }
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '获取数据失败',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_get_access_key_list.path}；${err.toString()}`
        });
      })
    })
  }

  // 修改secret
  oauthUpdateSecret(id, options) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_update_secret.url, {id});
      axios[URL_LIST.oauth_update_secret.method](url, options).then(response => {
        // console.log(response);
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  //删除access key
  oauthDeleteAccessKey(id) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_delete_access_key.url, {id});
      axios[URL_LIST.oauth_delete_access_key.method](url).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 添加访问配置
  oauthUpdateTargetApp(id, options) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_add_access_config.url, {id});
      axios[URL_LIST.oauth_add_access_config.method](url, options).then(response => {
        // console.log(response);
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 获取授权url列表
  oauthGetUrlPermissionList(id) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_get_url_permission_list.url, {id});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let resContent = this.getResponseContent2(response);
        if (Array.isArray(resContent)) {
          resContent.forEach(it => {
            if (it && it.hasOwnProperty('oauthUrl')) {
              it.resource = it.oauthUrl;
            }
          });
          resolve(resContent);
        } else {
          reject({
            title: '数据格式不正确',
            msg: '获取授权URL列表失败'
          })
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_get_url_permission_list.path}；${err.toString()}`
        });
      })
    })
  }

  // 获取授权URL列表
  oauthGetAuthorizeUrlList(options) {
    let transfer = (it) => {
      if (it.authTime) {
        it.authTime = this.$utils.formatDate(it.authTime, 'yyyy-MM-dd hh:mm:ss');
      } else {
        it.authTime = '';
      }
      if (it.authTime) {
        it.authTime = it.authTime.split(' ');
      }
      if (null == it.produceEnv) {
        it.profileName = null;
      } else {
        if (true == it.produceEnv) {
          it.profileName = '生产环境';
        } else if (false == it.produceEnv) {
          it.profileName = '非生产环境';
        }
      }
      // set property enabled
      // ['REQUESTED', 'AUTHORIZED', 'INVALIDATED']
      if (it.detailList.length === 0 || it.status === 'REQUESTED') {
        it.enabled = null;
      } else {
        if (it.status === 'AUTHORIZED') {
          it.enabled = true;
        } else if (it.status === 'INVALIDATED') {
          it.enabled = false;
        }
      }
    };
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_get_authorize_url_list.url, options).then(response => {
        // debug('o', response);
        // console.log(response);
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('authRecordList')) {
            let authRecordList = content['authRecordList'];
            if (Array.isArray(authRecordList)) {
              authRecordList.forEach(transfer.bind(this));
            }
          }
          resolve(content);
        } else {
          reject('获取Access Key列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  oauthGetTargetAppList(groupID) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_get_target_app_list.url, {id: groupID});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('targetApplicationList')) {
            resolve(content['targetApplicationList']);
          } else {
            reject('获取被访问的应用列表失败！');
          }
        } else {
          reject('获取被访问的应用列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 修改授权URL
  oauthModifyAuthorizeList(id, options) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_modify_authorize_url_list.url, {id: id});
    return new Promise((resolve, reject) => {
      axios[URL_LIST.oauth_modify_authorize_url_list.method](url, options).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 添加url权限配置
  oauthAddUrlPermission(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_add_url_permission.url, options).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '配置权限失败',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_add_url_permission.path}；${err.toString()}`
        });
      })
    })
  }

  // 删除url权限配置
  oauthRemoveUrlPermission(id) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_remove_url_permission.url, {id: id});
    return new Promise((resolve, reject) => {
      axios[URL_LIST.oauth_remove_url_permission.method](url).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg(response);
          if (resMsg && resMsg.msg) {
            reject(resMsg);
          } else {
            reject({
              title: '删除失败',
              msg: '请联系管理员'
            })
          }
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_remove_url_permission.path}；${err.toString()}`
        });
      })
    })
  }

  // 开启/禁用授权URL
  oauthToggleAuthorizeUrlEnable(id, options) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_authorize_url_toggle_enable.url, {id: id});
    return new Promise((resolve, reject) => {
      axios.patch(url, options).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
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
      axios.post(URL_LIST.work_order_list.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('workOrderDeployList') && Array.isArray(content.workOrderDeployList)) {
            content.workOrderDeployList.forEach(it => {
              if (it.hasOwnProperty('createTime')) {
               it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }
          debug('%s, %o', 'getWorkOrderList', content);
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
      axios.post(URL_LIST.work_order_todo_list.url, options).then(response => {
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
      axios.post(URL_LIST.work_order_in_handling.url, options).then(response => {
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
      return axios.post(URL_LIST.work_order_detail_feature_list.url, options);
    };
    const getAppList = () => {
      return axios.post(URL_LIST.work_order_detail_app_list.url, options);
    };
    const getUserToDo = () => {
      return axios.post(URL_LIST.work_order_detail_user_todo.url, options);
    };
    const getUserAccepted = () => {
      return axios.post(URL_LIST.work_order_detail_user_accepted.url, options);
    };
    const getUserNotify = () => {
      return axios.post(URL_LIST.work_order_detail_notify_user.url, options);
    };
    const getOperationList = () => {
      return axios.post(URL_LIST.work_order_detail_operation_list.url, options);
    };
    const getEmailGroup = () => {
      return axios.post(URL_LIST.work_order_detail_email_group.url, options)
    };
    const getTestLog = () => {
      return axios.post(URL_LIST.work_order_detail_test_log_list.url, options);
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
          REJECT: '拒绝处理',
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
        getUserNotify(), getOperationList(), getEmailGroup(), getTestLog()])
        .then(axios.spread((featureList, appList, userToDo, userAcceptedList,
                            notifyUserList, operationList, emailGroup, testLogStatus) => {
          featureList = this.getResponseContent(featureList);
          appList = this.getResponseContent(appList);
          userToDo = this.getResponseContent(userToDo);
          userAcceptedList = this.getResponseContent(userAcceptedList);
          notifyUserList = this.getResponseContent(notifyUserList);
          operationList = this.getResponseContent(operationList);
          emailGroup = this.getResponseContent(emailGroup);
          testLogStatus = this.getResponseContent(testLogStatus);

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

          let testType = null;
          let testLogList = [];
          if (testLogStatus.hasOwnProperty('testType')) {
            testType = testLogStatus['testType'];
          }
          if (testLogStatus.hasOwnProperty('workOrderDeployTestReport')) {
            testLogList = testLogStatus.workOrderDeployTestReport;
            testLogList.forEach(it => {
              it.url = encodeURI(this.$utils.formatUrl(URL_LIST.work_order_detail_download_test_log_get.url, {
                id: it.id
              }));
            });
          }

          let results = {
            featureList: featureList,
            appList: appList,
            userToDo: userToDo,
            userAcceptedList: userAcceptedList,
            notifyUserList: notifyUserList,
            operationList: operationList,
            emailGroup: emailGroup,
            testType: testType,
            testLogList: testLogList
          };
          resolve(results);
        })).catch(err => {
          reject(err);
      })
    })
  }

  /**
   * TODO: not used
   * 下载工单测试报告-通过POST方法
   */
  workOrderPostDownloadTestReport(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_detail_download_test_log_post.url, options).then(response => {
        debug('%s, %o', 'workOrderDownloadTestReport', response);
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    });
  }

  /**
   * 删除测试报告
   * @param id, 测试报告ID
   */
  workOrderRemoveTestReport(id) {
    const url = this.$utils.formatUrl(URL_LIST.work_order_delete_test_log.url, {id: id});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        debug('%s, %o', 'workOrderRemoveTestReport', response);
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

  // 创建工单
  createWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_create.url, options).then(response => {
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
      axios.post(URL_LIST.work_order_modify.url, options).then(response => {
        debug('%s, %o', 'modifyWorkOrder', response);
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
      axios.post(URL_LIST.work_order_remove.url, options).then(response => {
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
      axios.post(URL_LIST.work_order_app_deploy.url, options).then(response => {
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
      axios.post(URL_LIST.work_order_fetch_deploy_log.url, options).then(response => {
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
      axios.post(URL_LIST.check_before_handle_work_order.url, options).then(response => {
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
      axios.post(URL_LIST.work_order_submit_handle.url, options).then(response => {
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

}

export default new Net();