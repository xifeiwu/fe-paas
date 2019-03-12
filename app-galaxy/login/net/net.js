/**
 * Created by xifei.wu on 2017/12/5.
 */
import Vue from 'vue';
import axios from 'axios';
import NetBase from 'assets/js/net';
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
    const updateMenuConfig = (item) => {
      let keyMap = {
        // 应用管理
        '/2.x/app': {
          router: this.page['profile/app'],
          icon: 'paas-icon-app'
          // icon: 'el-icon-location'
        },
        // 服务管理
        '/2.x/service': {
          router: this.page['profile/service'],
          icon: 'paas-icon-service'
        },
        // pipeline
        '/2.x/pipeline': {
          router: this.page['profile/pipeline'],
          icon: 'paas-icon-jenkins',
          beta: true
        },
        // 实例列表
        '/2.x/instances': {
          router: this.page['profile/instance'],
          icon: 'paas-icon-instance'
        },
        // 外网域名
        '/2.x/internet': {
          router: this.page['profile/domain'],
          icon: 'paas-icon-domain',
        },
        // 日志中心
        '/2.x/logs': {
          router: this.page['profile/log'],
          icon: 'paas-icon-log'
        },
        // 应用监控
        '/2.x/apm': {
          router: this.page['profile/monitor'],
          icon: 'paas-icon-charts',
          beta: true
        },
        // Access Key管理
        '/2.x/keys': {
          name: 'Access Key管理',
          router: this.page['profile/oauth'],
          icon: 'paas-icon-key'
        },
        // 审批管理
        '/2.x/orders': {
          router: this.page['profile/work-order'],
          icon: 'paas-icon-work-order'
        },
        // 应用配置
        '/2.x/config/server': {
          name: '应用配置',
          router: this.page['profile/config-server'],
          icon: 'paas-icon-config'
        },
        // 镜像中心
        '/2.x/images': {
          router: this.page['profile/image/repo'],
          icon: 'paas-icon-image',
          beta: true
        },
        // mariadb中间件
        '/2.x/openShift/mariaDB': {
          router: this.page['profile/middleware/mariadb'],
          icon: 'paas-icon-mysql',
          name: 'mariadb(非生产)',
          beta: true
        },
        // redis中间件
        '/2.x/openShift/redis': {
          router: this.page['profile/middleware/redis'],
          icon: 'paas-icon-redis',
          name: 'redis',
          beta: true
        },
        // 管理后台
        '/2.x/backstage': {
          name: '管理后台',
          router: '/manage',
          icon: 'el-icon-setting'
        }
      };
      const key = item.path;
      if (keyMap.hasOwnProperty(key)) {
        item = Object.assign(item, keyMap[key]);
      }
      return item;
    };

    let menuList = [];
    if (content.hasOwnProperty('menuList') && Array.isArray(content.menuList)) {
      // 需要忽略的菜单
      const menuPathToIgnore = [
        // '/2.x/pipeline', // pipeline
        // '/2.x/openShift/redis', // redis中间件
        '/2.x/backstage'// "后台管理"
      ];
      menuList = content.menuList.map(it => {
        // append some property to each item
        return updateMenuConfig(it);
      }).filter(it => {
        return menuPathToIgnore.indexOf(it.path) === -1;
      }).map(it => {
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

  parseLoginResponseMore(resContent) {
    let origin = this.parseLoginResponse(resContent);
    // let contentOfAppEngine = ['应用管理', '服务管理','实例列表', '外网域名', '日志中心', '应用监控', '审批管理'];
    const pathOfAppEngine = [
      '/2.x/app', // 应用管理
      '/2.x/service', // 服务管理
      '/2.x/instances', // 实例列表
      '/2.x/internet', // 外网域名
      '/2.x/logs', // 日志中心
      '/2.x/apm', // 应用监控
      '/2.x/orders' // 审批管理
    ];
    const pathOfMiddleware = [
      '/2.x/openShift/mariaDB', //mariadb中间件
      '/2.x/openShift/redis' //redis中间件
    ];
    const level2 = [{
      name: '应用引擎',
      icon: 'paas-icon-app',
      router: '/profile/app-engine',
      children: []
    }, {
      name: '中间件与数据库',
      icon: 'paas-icon-openshift',
      router: '/profile/middleware',
      children: []
    }];
    const level1 = [];
    origin.menuList.forEach(it => {
      if (pathOfAppEngine.indexOf(it.path) > -1) {
        level2[0].children.push(it);
      } else if(pathOfMiddleware.indexOf(it.path) > -1) {
        level2[1].children.push(it);
      } else {
        level1.push(it)
      }
    });

    // remove item in level2 when the length of item.length == 0
    for (let i = 0; i < level2.length; i++) {
      if (level2[i].children.length === 0) {
        level2.splice(i, 1);
      }
    }
    // level2
    origin.menuConfig = {
      level1, level2
    };
    // console.log(origin);
    return origin;
  }

}

export default new Net();