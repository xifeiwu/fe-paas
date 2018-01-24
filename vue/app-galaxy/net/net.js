/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from './url';
import utils from '../../assets/js/utils';
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
  getResponseMsg(response) {
    let result = {
      success: false,
      msg: '失败'
    };
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        result.success = true;
        result.msg = '成功！';
      } else {
        result.success = false;
        result.msg = '失败！';
      }
      if (data.hasOwnProperty('msg') && data.msg &&(data.msg.length > 0)) {
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
          router: '/profile/log'
        },
        "应用监控": {
          router: '/profile/monitor'
        },
        "Oauth权限": {
          router: '/profile/oauth',
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
      if ('data' in response && 'content' in response.data) {
        let content = response.data.content;
        let twoLevelMenu = [];
        let permission = content.permission;
        permission = permission.map(it => {
          return updateItem(it);
        });
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
   * resolve only when content data is ok.
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
          if (content) {
            resolve(content);
          }
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
          fileLocation: it.fileLocation ? it.fileLocation : []
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

              it.volume = it.volume.split(',').filter(it => {return it})
              utils.renameProperty(it, 'volume', 'fileLocation');

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
    };
    let url = urlMap[prop];
    console.log(url);
    if (!url) {
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

  /**
   * 获取镜像列表相关信息
   * 1. autoImageList， 自动打镜像列表
   * 2. customEnvImageList, 自定义镜像-环境镜像列表
   * 3. privateAppList， 自定义镜像-项目列表
   * @param options
   * @returns {Promise}
   */
  getImageRelatedInfo(options4Auto, options4Env, options4PrivateApp) {
    const getAutoImageList = () => {
      return axios.post(URL_LIST.auto_image_list, options4Auto);
    };
    const getCustomEnvImageList = () => {
      return axios.post(URL_LIST.custom_image_env_list, options4Env);
    };
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
   * 自定义镜像， 通过项目获取版本列表
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
            utils.renameProperty(it, 'id', 'instanceName');
            utils.renameProperty(it, 'state', 'status');
            utils.renameProperty(it, 'ip', 'intranetIP');
            utils.renameProperty(it, 'updated', 'createTime');
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

  // 获取部署列表
  getDeployLogList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_deploy_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('deployLogList')) {
          content.deployLogList.forEach(it => {
            it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
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
               it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }
          resolve(content);
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
                it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
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
          PASS: '通过'
        }
      },
      operationList: {
        functionType: {
          'WORKORDER_APPLY': '工单申请',
          'WAIT_TEST': '等待测试',
          'TESTING': '测试受理中',
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
      axios.all([getFeatureList(), getAppList(), getUserToDo(), getUserAccepted(), getOperationList(), getEmailGroup()])
        .then(axios.spread((featureList, appList, userToDo, userAcceptedList, operationList, emailGroup) => {
          featureList = this.getResponseContent(featureList);
          appList = this.getResponseContent(appList);
          userToDo = this.getResponseContent(userToDo);
          userAcceptedList = this.getResponseContent(userAcceptedList);
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
          if (operationList.hasOwnProperty('WorkOrderDeployLogVO')) {
            operationList = operationList.WorkOrderDeployLogVO;
            Array.isArray(operationList) && operationList.forEach(it => {
              it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
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