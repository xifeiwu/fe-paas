/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from './url';
import utils from '../utils';

class Net {
  constructor() {
    this.SHOW_LOG = true;
    this.utils = utils;
  }

  showLog(func, data) {
    console.log(func + ' in net.js');
    console.log(data);
  }

  getResponseContent (response) {
    let content = {};
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        content = data.content;
      } else {
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  }

  login (res) {
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/profile/app_manager',
          icon: 'el-icon-location'
        },
        "服务管理": {
          router: '/profile/service_manager'
        },
        "审批管理": {
          router: '/profile/approve_manager'
        },
        "实例列表": {
          router: '/profile/instance_list'
        },
        "外网域名": {
          router: '/profile/domain_name'
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

  getGroupList () {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_group_id).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
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
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          this.showLog('getAPPList', content);
          if (content.hasOwnProperty('appList') && Array.isArray(content.appList)) {
            content.appList.forEach(it => {
              it.createTime = this.utils.formatDate(it.createTime, 'yyyy-MM-dd');
              if ('spaceList' in it && Array.isArray(it.spaceList)) {
                it.spaceList = it.spaceList.map(it => {
                  return '<div>' + it + '</div>';
                }).join();
              }
            });
          }
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
        let content = Object.assign(this.getResponseContent(cpu_and_memory), this.getResponseContent(language));
        if (content.hasOwnProperty('LanguageList')) {
          content.LanguageList.forEach(it => {
            let language = it.language;
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
            if (it.hasOwnProperty('packageTypeList')) {
              it.packageTypeList = it.packageTypeList.map(it => {
                return {
                  type: it,
                  packageType: it.replace('_', '.')
                }
              });
            }
          });
        }
        // console.log(content);
        //两个请求现已完成
        this.showLog('getMessageForCreateAPP', content);
        resolve(content);
      })).catch(err => {
        this.showLog('getMessageForCreateAPP', err);
        reject(err);
      });

    })
  }

  createAPP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.create_app, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        }
      }).catch(err => {
        console.log(err);
      });
    });
  }
}

export default new Net();