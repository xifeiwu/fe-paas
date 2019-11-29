/**
 * Created by xifei.wu on 2017/12/5.
 */
import NetBase from 'assets/js/net';
const cryptoAes = require('crypto-js/aes');
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
        path: '/paas-login',
        method: 'post'
      },
      'cas-login': {
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
    const ASSIST_URL_LIST = {
      cas_validate: {
        path: '/api/cas/service-validate',
        method: 'post'
      }
    };
    Object.keys(ASSIST_URL_LIST).forEach(key => {
      let item = ASSIST_URL_LIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });

    this.URL_LIST = Object.assign(PAAS_URL_LIST, ASSIST_URL_LIST);
  }

  _parseMenuList (menuList) {
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
        },
        // Access Key管理
        '/2.x/keys': {
          name: 'Access Key管理',
          router: this.page['profile/oauth'],
          icon: 'paas-icon-key'
        },
        // api网关
        '/2.x/gateway': {
          name: 'API网关',
          router: this.page['profile/gateway'],
          icon: 'paas-icon-gateway'
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
        },
        // mariadb中间件
        '/2.x/openShift/mariaDB': {
          router: this.page['profile/middleware/mariadb'],
          icon: 'paas-icon-mysql',
          name: 'Mariadb(非生产)',
          beta: true
        },
        // redis中间件
        '/2.x/openShift/redis': {
          router: this.page['profile/middleware/redis'],
          icon: 'paas-icon-redis',
          name: 'Redis',
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

    // 需要忽略的菜单
    const menuIgnore = [
      // '/2.x/pipeline', // pipeline
      // '/2.x/openShift/redis', // redis中间件
      '/2.x/backstage'// "后台管理"
    ];
    return menuList.concat([
      // {
      //   path: '/2.x/gateway'
      // }
    ]).map(it => {
      // append some property to each item
      return updateMenuConfig(it);
    }).filter(it => {
      return menuIgnore.indexOf(it.path) === -1;
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

  /**
   * format of resContent:
   {
     excludeList: [], // not used
     user: {
       email: 'wuxifei@finupgroup.com',
       guest: false,
       id: 956,
       username: 'wuxifei',
       realName: '吴西飞'
       role: '平台管理员'
     },
     menuList: [],
     token: '20190121-88191cc3-47c0-4886-aa5c-f0d70efbcef6'
   }
   */
  formatLoginResContent(resContent) {
    // add property token to user if exist
    const menuList = this._parseMenuList(resContent.menuList);

    // generate menuConfig
    const pathOfAppEngine = [
      '/2.x/app', // 应用管理
      '/2.x/service', // 服务管理
      '/2.x/instances', // 实例列表
      '/2.x/internet', // 外网域名
      '/2.x/logs', // 日志中心
      '/2.x/apm', // 应用监控
      '/2.x/gateway', // api网关
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
    menuList.forEach(it => {
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
    const menuConfig = {
      level1, level2
    };

    // resContent.user.token = resContent.token;
    const user = resContent.user;
    const userInfo = {
      userName: user.username,
      realName: user.realName,
      token: resContent.token,
      email: user.email,
      role: user.role,
    };
    userInfo.auth = cryptoAes.encrypt(`${userInfo.realName}:${userInfo.userName}:${userInfo.token}`, 'paas').toString();
    return {
      menuList, menuConfig, userInfo
    }
  }

}

export default new Net();