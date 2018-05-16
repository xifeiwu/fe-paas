/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import {URL_LIST} from './url';
import NetBase from '$assets/js/net';
var debug = browserDebug('pass-fe:net');

class Net extends NetBase {
  constructor() {
    super();
  }

  setVue(Vue) {
    this.$utils = Vue.prototype.$utils;
  }

  parseLoginResponse (content) {
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
          icon: 'my-icon-key'
        },
        "审批管理": {
          router: '/profile/work-order',
          icon: 'my-icon-work-order'
        },
      };
      let key = item.name;
      if (keyMap.hasOwnProperty(key)) {
        let props = keyMap[key];
        for (let key in props) {
          item[key] = props[key];
        }
      }
      return item;
    }

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

    // let menuToIgnore = ["应用监控", "Oauth权限"];
    let menuToIgnore = ["应用监控"];
    oneLevelMenu = oneLevelMenu.filter(it => {
      return menuToIgnore.indexOf(it.name) === -1;
    }).map(it => {
      if (it.name === 'Oauth权限') {
        it.name = 'Access Key管理';
      }
      if (it.hasOwnProperty('children')) {
        delete it.children;
      }
      return it;
    });
    return {
      userInfo: content.user,
      menuList: oneLevelMenu
    };
  }

  login(data) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.login, data).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(this.parseLoginResponse(content));
        } else {
          let responseMsg = this.getResponseMsg(response);
          reject(responseMsg);
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
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

}

export default new Net();