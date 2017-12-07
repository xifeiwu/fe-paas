/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from '../config/url';

export default {
  getResponseContent: function (response) {
    let content = null;
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        content = data.content;
      } else {
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  },
  login: function (res) {
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
  },
  getGroupList: function () {
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
  },
  getAPPList: function (options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.app_list, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        }
      }).catch(err => {
      });
    });
  },

  getProfileOfGroup: function(options) {
    console.log('getProfileOfGroup');
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_profile_of_group, options).then(response => {
        console.log('getProfileOfGroup');
        let content = this.getResponseContent(response);
        console.log(content);
        if (content) {
          console.log(content);
          resolve(content);
        }
      }).catch(err => {
      });
    });
  }
}
