/**
 * Created by xifei.wu on 2017/12/5.
 */
import Vue from 'vue';
import axios from 'axios';
import NetBase from '$assets/js/net';
// var debug = browserDebug('pass-fe:net');

class Net extends NetBase {
  constructor() {
    super();
    const PAAS_URL_LIST = {
      // 获取验证码
      'get_verify_code': {
        path: '/createRandomImage',
        method: 'get'
      },
      // 登录
      'login': {
        path: '/login',
        method: 'post'
      },
      // 用户退出
      'logout': {
        path: '/userLogout',
        method: 'get'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    this.URL_LIST = Object.assign(PAAS_URL_LIST);
  }

  parseLoginResponse (content) {
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/app',
          icon: 'paas-icon-app'
          // icon: 'el-icon-location'
        },
        "服务管理": {
          router: '/service',
          icon: 'paas-icon-service'
        },
        "实例列表": {
          router: '/instance',
          icon: 'paas-icon-instance'
        },
        "外网域名": {
          router: '/domain',
          icon: 'paas-icon-domain',
        },
        "日志中心": {
          router: '/log',
          icon: 'paas-icon-log'
        },
        "应用监控": {
          router: '/monitor',
          icon: 'paas-icon-monitor'
        },
        "Oauth权限": {
          router: '/oauth',
          icon: 'paas-icon-key'
        },
        "Access Key管理": {
          router: '/oauth',
          icon: 'paas-icon-key'
        },
        "审批管理": {
          router: '/work-order',
          icon: 'paas-icon-work-order'
        },
        "配置中心": {
          router: '/config-server',
          icon: 'paas-icon-config'
        }
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

    let menuList = [];
    if (content.hasOwnProperty('menuList') && Array.isArray(content.menuList)) {
      // let menuToIgnore = ["应用监控", "Oauth权限"];
      let menuToIgnore = ["应用监控"];
      menuList = content.menuList.map(it => {
        // append some property to each item
        return updateItem(it);
      }).filter(it => {
        return menuToIgnore.indexOf(it.name) === -1;
      }).map(it => {
        if (it.name === 'Oauth权限') {
          it.name = 'Access Key管理';
        }
        it.hasOwnProperty('children') && delete it.children;
        it.hasOwnProperty('createTime') && delete it.createTime;
        it.hasOwnProperty('permissionType') && delete it.permissionType;
        it.hasOwnProperty('updateTime') && delete it.updateTime;
        it.hasOwnProperty('updateTime') && delete it.updateTime;
        it.hasOwnProperty('parentId') && delete it.parentId;
        return it;
      });
    }
    let notPermitted = [];
    if (content.hasOwnProperty('excludeList') && Array.isArray(content['excludeList'])) {
      notPermitted = content['excludeList'].map(it => {
        it.hasOwnProperty('id') && delete it.id;
        it.hasOwnProperty('createTime') && delete it.createTime;
        it.hasOwnProperty('updateTime') && delete it.updateTime;
        it.hasOwnProperty('parentId') && delete it.parentId;
        it.hasOwnProperty('permissionType') && delete it.permissionType;
        return it;
      })
    }

    // add property token to user if exist
    if (content.hasOwnProperty('token')) {
      content.user.token = content.token;
    }

    // generate two level menu tree by parentId
    // let twoLevelMenu = [];
    // permission.forEach(it => {
    //   if (0 === it.parentId) {
    //     twoLevelMenu.push(it);
    //   }
    // });
    // permission.forEach(it => {
    //   if (0 !== it.parentId) {
    //     let findParent = twoLevelMenu.some(pItem => {
    //       if (it.parentId === pItem.id) {
    //         if (!pItem.hasOwnProperty('children')) {
    //           pItem.children = [];
    //         }
    //         pItem.children.push(it);
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     });
    //     if (!findParent) {
    //       twoLevelMenu.push(it);
    //     }
    //   }
    // });
    // generate one level menu from two level menu
    // let oneLevelMenu = [];
    // twoLevelMenu.forEach(it => {
    //   oneLevelMenu.push(it);
    //   if (it.hasOwnProperty('children')) {
    //     it.children.forEach(it2 => {
    //       oneLevelMenu.push(it2);
    //     })
    //   }
    // });

    return {
      userInfo: content.user,
      menuList, notPermitted
    };
  }

  logout() {
    return new Promise((resolve, reject) => {
      axios.get(this.URL_LIST.logout.path).then(res => {
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