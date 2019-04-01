import AppMain from './app/main-v2.vue';
import AppAdd from './app/add-v2.vue';

// service
import serviceDetail from './service/detail.vue';
import ServiceAdd from './service/add-v2.vue';
import serviceList from './service/list.vue';

import InstanceMain from './instance/main.vue';

//pipeline
import pipeLine from './pipeline';
import pipelineAdd from './pipeline/add';
import pipeLineList from "./pipeline/main"
import pipeLineRecord from "./pipeline/record"
import pipelinePlan from './pipeline/plan'

import DomainMain from './domain/main.vue';
import DomainWhiteList from './domain/white-list.vue';

import LogMain from './log/main.vue';
import LogRun from './log/run.vue';
import LogDeploy from './log/deploy.vue';

import MonitorMain from './monitor/main.vue';
// const MonitorMain = () => {
//   return import(
//   /* webpackChunkName: "profileMonitor" */
//   /* webpackMode: "lazy" */
//   './monitor/main.vue')
// };

import OAuthMain from './oauth/main.vue';
import OAuthKey from './oauth/key.vue';
import OAuthURL from './oauth/url.vue';

import WorkOrderMain from './work-order/main.vue';
import WorkOrderToDo from './work-order/todo.vue';
import WorkOrderList from './work-order/list.vue';
import WorkOrderAdd from './work-order/todo/add.vue';
import WorkOrderModify from './work-order/todo/modify.vue';
import WorkOrderDeploy from './work-order/todo/deploy.vue';
import WorkOrderAccept from './work-order/todo/accept.vue';
import WorkOrderTest from './work-order/todo/test.vue';

// middleware
import Middleware from './middleware/main.vue';
import MiddlewareMariadb from './middleware/mariadb/index.vue';
import MiddlewareMariadbAdd from './middleware/mariadb/add.vue';
import MiddlewareMariadbBackup from './middleware/mariadb/backup.vue';
import MiddlewareMariadbHistory from './middleware/mariadb/history.vue';
import middlewareRedis from './middleware/redis/index.vue';
import middlewareRedisAdd from './middleware/redis/add.vue';
import middlewareRedisModify from './middleware/redis/add.vue';

// config-server
import ConfigServerMain from './config-server/main.vue';
import ConfigServerFileList from './config-server/list.vue';

// cdn
import CdnMain from './cdn/main.vue';
import CdnList from './cdn/list.vue';
import CdnCreate from './cdn/create.vue';
import CdnEdit from './cdn/edit.vue';
import CdnPrefetch from './cdn/prefetch.vue';
import CdnStatistics from './cdn/statistics.vue';
import CdnDashboard from './cdn/dashboard.vue';

//image
import ImageList from './image/main.vue';
import ImageVersion from './image/version.vue';

import Vue from 'vue';
import VueRouter from 'vue-router';

import pathToRegexp from 'path-to-regexp';

/**
 * router config:
 * 1. path should have the same name as .vue file
 * 2. as limited by webpack require context, componentFile is the path under dir ../pages
 * 3. url path should be correspond with page logic, as it is used for breadcrumb. such as
 *    if add app is sub page of app, its url should be app/add
 */
class Helper {
  constructor() {
    this.richRouterConfig = [{
      path: '/profile',
      redirect: '/profile/app',
    }, {
      path: '/profile/app',
      name: '应用管理',
      component: AppMain,
      meta: {
        isPermitted: true,
      },
    }, {
      path: '/profile/app/add',
      name: '创建应用',
      component: AppAdd,
    }, {
      path: '/profile/app/update',
      name: '修改应用',
      component: AppAdd,
    }, {
      path: '/profile/service',
      name: '服务管理',
      component: serviceList,
    }, {
      path: '/profile/service/add',
      name: '创建服务',
      component: ServiceAdd,
    }, {
      path: '/profile/service/modify',
      name: '修改配置',
      component: ServiceAdd,
    },{
      path: '/profile/service/copy',
      name: '复制服务',
      component: ServiceAdd,
    }, {
      path: '/profile/service/detail',
      name: '服务详情',
      component: serviceDetail
    }, {
      path: '/profile/pipeline',
      name: 'Pipeline',
      component: pipeLine,
      redirect: '/profile/pipeline/list',
      children: [{
        path: 'list',
        // name: '列表',
        component: pipeLineList,
      }, {
        path: 'add',
        name: '添加pipeline',
        component: pipelineAdd
      }, {
        path: 'modify',
        name: '修改配置',
        component: pipelineAdd
      }, {
        path: 'update',
        name: '修改配置',
        component: pipelineAdd
      }, {
        path: 'records',
        name: '执行记录',
        component: pipeLineRecord,
      }, {
        path: 'records/plan',
        name: '执行进度',
        component: pipelinePlan,
      }]
    },{
      path: '/profile/instance',
      name: '实例列表',
      component: InstanceMain,
    }, {
      path: '/profile/domain',
      name: '外网域名',
      component: DomainMain,
    }, {
      path: '/profile/domain/white-list',
      name: '关联IP白名单',
      component: DomainWhiteList,
    }, {
      path: '/profile/log',
      // name: '审批管理',
      component: LogMain,
      // redirect: '/profile/log/run',
      children: [{
        path: 'run',
        name: '运行日志',
        component: LogRun,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'deploy',
        name: '部署日志',
        component: LogDeploy,
        meta: {
          keepAlive: true
        }
      }]
    },
      {
      path: '/profile/monitor',
      name: '应用监控',
      component: MonitorMain,
    },
      {
      path: '/profile/oauth',
      // name: '权限管理',
      component: OAuthMain,
      // redirect: 'oauth/key',
      children: [{
        path: 'key',
        name: 'ClientId列表',
        component: OAuthKey,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'url',
        name: '授权URL',
        component: OAuthURL,
        meta: {
          keepAlive: true
        }
      }]
    }, {
      path: '/profile/work-order',
      // name: '审批管理',
      component: WorkOrderMain,
      // redirect: '/work-order/todo',
      children: [{
        path: 'todo',
        name: '待办工单',
        component: WorkOrderToDo,
      }, {
        path: 'list',
        name: '工单列表',
        component: WorkOrderList,
      }]
    }, {
      path: '/profile/work-order/todo/add',
      name: '申请工单',
      component: WorkOrderAdd,
    }, {
      path: '/profile/work-order/todo/modify',
      name: '修改工单',
      component: WorkOrderAdd,
    }, {
      path: '/profile/work-order/todo/deploy',
      name: '部署工单',
      component: WorkOrderDeploy,
    }, {
      path: '/profile/work-order/todo/test',
      name: '测试工单',
      component: WorkOrderTest,
    }, {
      path: '/profile/work-order/todo/accept',
      name: '验收工单',
      component: WorkOrderAccept,
    }, {
      path: '/profile/middleware',
      // name: '中间件',
      component: Middleware,
      children: [{
        path: 'mariadb',
        name: 'Mariadb服务',
        component: MiddlewareMariadb,
      }, {
        path: 'mariadb/add',
        name: '申请MariaDB服务',
        component: MiddlewareMariadbAdd,
      }, {
        path: 'mariadb/modify',
        name: '修改MariaDB服务',
        component: MiddlewareMariadbAdd,
      }, {
        path: 'mariadb/history',
        name: '操作历史',
        component: MiddlewareMariadbHistory,
      }, {
        path: 'mariadb/backup',
        name: '备份与恢复',
        component: MiddlewareMariadbBackup,
      }, {
        path: 'redis',
        name: 'redis实例',
        component: middlewareRedis
      }, {
        path: 'redis/add',
        name: '申请实例',
        component: middlewareRedisAdd
      }, {
        path: 'redis/modify',
        name: '修改配置',
        component: middlewareRedisModify
      }]
    }, {
      path: '/profile/config-server',
      name: '配置中心',
      component: ConfigServerMain
    }, {
      path: '/profile/config-server/list',
      name: '配置文件列表',
      component: ConfigServerFileList,
    }, {
      path: '/profile/cdn',
      name: 'cdn加速',
      component: CdnMain,
      children: [
        {
          path: 'list',
          name: '加速域名列表',
          component: CdnList,
        },
        {
          path: 'create',
          name: '创建加速域名',
          component: CdnCreate,
        },
        {
          path: 'edit',
          name: '修改配置',
          component: CdnEdit,
        },
        {
          path: 'prefetch',
          name: '刷新预取',
          component: CdnPrefetch,
        },
        {
          path: 'statistics',
          name: '统计分析',
          component: CdnStatistics,
        },
        {
          path: 'dashboard',
          name: '统计分析',
          component: CdnDashboard,
        },
      ]
    }, {
      path: '/profile/image/repo',
      name: '镜像仓库',
      component: ImageList,
    },
    //   {
    //   path: '/profile/image/:id/list',
    //   name:'镜像详情',
    //   component: ImageDetail,
    // },
      {
        path: '/profile/image/repo/version',
        name:'镜像版本',
        component: ImageVersion,
      }
    ];
    this.addRoutePath(null, this.richRouterConfig);

    // this.vueRouter = new VueRouter({
    //   mode: 'history',
    //   base: __dirname,
    //   // routes: routeConfig,
    //   routes: this.getVueRouterConfig()
    // });
    // Vue.use(VueRouter);

    // this.routePathList = this.getAllRouterPath();
    this.routePathToConfig = this.getRoutePathToConfig();

    // setTimeout(() => {
      // add permission by config from localStorage
      // this.addPermission(Vue.prototype.$storeHelper.notPermitted);
    // });
    // console.log(this.$storeHelper.notPermitted);
    // this.startRouteFilter()
    this.pathList = [];
    this.preRouter = null;
  }
  /**
   * traverse router config tree to add routerPath to all component:
   * routerPath = parent.path + path, it is the full path of hash in url
   * @param path
   * @param component
   */
  addRoutePath() {
    function updateItem(path, item) {
      if (null !== path) {
        item.routePath = path + '/' + item.path;
      } else {
        item.routePath = item.path;
      }
    }

    function traverseComponent(path, component) {
      if (Array.isArray(component)) {
        component.forEach(traverseComponent.bind(this, path));
      } else if ('object' === typeof(component)) {
        updateItem.call(this, path, component);
        if (component.hasOwnProperty('children')) {
          traverseComponent(component.routePath, component['children']);
        }
      }
    }

    traverseComponent(null, this.richRouterConfig);
    // console.log(this.richRouterConfig);
  }

  /**
   * add prop isPermitted to all item in richRouteConfig. called by:
   * 1. constructor of this class
   * 2. created of profile.vue
   * @param permissionMap: {'/app': true, '/oauth/key': true}
   */
  addPermission(notPermittedList) {
    function updateItem(item) {
      if (item.hasOwnProperty('routePath')) {
        if (!item.hasOwnProperty('meta')) {
          item.meta = {};
        }
        item.meta['isPermitted'] = notPermittedList.indexOf(item.routePath) > -1 ? false : true;
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
  }

  /**
   * 更新路径配置文件(是否禁用)
   * @param pathList, path to set. can be string or regexp
   * @param type, exclude or include
   * @param tip, tip message
   * disabled: {
  *   'NO_APP', // 当前团队应用数为零。请先创建应用，才能进行后续操作
  *   'NOT_SUPPORT_IN_1.X' // '您当前在1.x团队，部分功能正在迁移。置灰的功能暂时无法使用！
  * }
   */
  updateDisabledState({pathList, pathType}, {key, value}) {
    function updateItem(item) {
      if (item.hasOwnProperty('routePath')) {
        if (!item.hasOwnProperty('meta')) {
          item.meta = {};
        }
        if (!item.meta.hasOwnProperty('disabled')) {
          item.meta['disabled'] = {
            'NO_APP': false,
            'NOT_SUPPORT_IN_1': false,
          };
        }

        const strList = [];
        const regList = [];
        const isRegExp = Vue.prototype.$utils.isRegExp;
        pathList.forEach(it => {
          if (isRegExp(it)) {
            regList.push(it);
          } else {
            strList.push(it);
          }
        });

        const isPathMatch = (path) => {
          let match = false;
          if (strList.indexOf(path) > -1) {
            match = true;
          }
          if (!match) {
            regList.some(reg => {
              match = path.match(reg) ? true : false;
              return match;
            })
          }
          return match
        };

        switch (pathType) {
          case 'exclude':
            if (isPathMatch(item['routePath'])) {
            } else {
              item.meta['disabled'][key] = value;
            }
            break;
          case 'include':
            if (isPathMatch(item['routePath'])) {
              item.meta['disabled'][key] = value;
            } else {
            }
            break;
        }
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
  }

  // filter out useless config in richRouterConfig
  getVueRouterConfig() {
    function updateItem(item) {
      let keysMap = {
        path: 'path',
        name: 'name',
        props: 'props',
        redirect: 'redirect',
        component: 'component',
        meta: 'meta',
      };
      let result = {};
      for (let key in item) {
        if (item.hasOwnProperty(key) && keysMap.hasOwnProperty(key)) {
          if ('componentFile' === key) {
            // result[keysMap[key]] = this.load(item[key]);
          } else {
            result[keysMap[key]] = item[key];
          }
        }
      }
      return result;
    }

    function traverseComponent(component) {
      if (Array.isArray(component)) {
        return component.map(traverseComponent.bind(this));
      } else if ('object' === typeof(component)) {
        let config = updateItem.call(this, component);
        if (component.hasOwnProperty('children')) {
          config['children'] = traverseComponent(component['children']);
        }
        return config;
      }
    }

    let vueRouterConfig = traverseComponent(this.richRouterConfig);
    return vueRouterConfig;
  }

  traverseComponent(func, component) {
    if (Array.isArray(component)) {
      component.forEach(this.traverseComponent.bind(this, func));
    } else if ('object' === typeof(component)) {
      func.call(this, component);
      if (component.hasOwnProperty('children')) {
        this.traverseComponent(func, component['children']);
      }
    }
  }

  /**
   * get all routePath in router config tree. it can be used:
   * 1. check whether current url is validate.
   * TODO: not used
   */
  getAllRouterPath() {
    let routePath = [];

    function updateItem(item) {
      if (item.hasOwnProperty('routePath')) {
        routePath.push(item.routePath);
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return routePath;
  }

  /**
   * get routePath to name, in the following format:
   * {
   *   '/login': "登录",
   *   '/profile':"详情",
   *   '/profile/app':"应用管理",
   *   '/profile/app/add':"创建应用",
   *   '/profile/domain_name':"外网域名",
   *   '/profile/instance':"实例列表",
   *   '/profile/service':"服务管理"
   *  }
   * used in:
   * 1. profile.vue
   */
  getRoutePathToName() {
    let routePath = {};

    function updateItem(item) {
      if (item.hasOwnProperty('routePath') && item.hasOwnProperty('name')) {
        if (item.name && item.routePath) {
          routePath[item.routePath] = item.name;
        }
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return routePath;
  }

  getRoutePathToConfig() {
    let result = {};

    function updateItem(item) {
      if (item.hasOwnProperty('routePath') && item.routePath) {
        result[item.routePath] = item;
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return result;
  }

  getConfigByRouterPath(path) {
    var result = null;
    if (!path) {
      return result;
    }
    const routerPathToConfig = this.getRoutePathToConfig();
    for (let key in routerPathToConfig) {
      if (pathToRegexp(key).exec(path)) {
        result = routerPathToConfig[key];
        break;
      }
    }
    return result;
  }

  getPathByRouterPath(routerPath, payload) {
    return routerPath.split('/').map(it => {
      if (it.startsWith(':')) {
        const key = it.substring(1);
        if (payload.hasOwnProperty(key)) {
          return payload[key];
        } else {
          return it;
        }
      } else {
        return it;
      }
    }).join('/');

  }

  /**
   * get permitted children in routeConfig by routePath
   * @param routePath, such as '/log', '/oauth'
   * @returns {Array}
   */
  getPermittedSubRouteList(routePath) {
    let result = [];
    let routePathToConfig = this.getRoutePathToConfig();
    if (routePathToConfig.hasOwnProperty(routePath) && routePathToConfig[routePath].hasOwnProperty('children')) {
      result = routePathToConfig[routePath].children.filter(it => {
        let isPermitted = true;
        if (it.hasOwnProperty('meta') && it.meta.hasOwnProperty('isPermitted')) {
          isPermitted = it.meta.isPermitted;
        }
        return isPermitted;
      })
    }
    // filter item with property 'name'
    result = result.filter(it => {
      return it.hasOwnProperty('name');
    });
    return JSON.parse(JSON.stringify(result));
  }


  /**
   * rename router name in richRouterConfig
   */
  async renameRouterName(targetPath, rename , parentPath) {
    let targetRouterPath = null;
    if (parent) {
      targetRouterPath = this.richRouterConfig.find(it => {
        return it.path == parentPath;
      }).children.find(it => {
        return it.path == targetPath;
      });
    } else {
      targetRouterPath = this.richRouterConfig.find(it => {
        return it.path == targetPath;
      });
    }
    await new Promise((resolve, reject) => {
      targetRouterPath.name = rename;
      resolve();
    })
  }

  /**
   * do some action before route change
   */
  startRouteFilter(vueRouter) {
    const ROOT_PATH = '/profile';

    // get parent path of the path
    const getParentPath = (path) => {
      var result = '';
      if (!path.startsWith(ROOT_PATH)) {
        result = ROOT_PATH;
      } else {
        result = path.split('/').slice(0, -1).join('/');
        if (!result) {
          result = ROOT_PATH;
        }
      }
      return result;
    };

    // if the path is valid
    const isPermittedPath = (path) => {
      var permitted = true;
      const config = this.routePathToConfig[path];
      // console.log(path);
      // console.log(config);
      if (!config) {
        return false;
      }
      if (config.hasOwnProperty('meta') && config.meta.hasOwnProperty('isPermitted')) {
        permitted = config.meta.isPermitted;
      }
      if (config.hasOwnProperty('children')) {
        permitted = false;
      }
      return permitted;
    };

    // get nearest path if the path is not valid
    const getPermittedPath = (path) => {
      var result = '';
      let firstValidChild = null;
      const config = this.routePathToConfig[path];
      // find downward
      if (config && config.hasOwnProperty('children')) {
        config.children.some(it => {
          if (isPermittedPath(it.routePath)) {
            firstValidChild = it;
          }
          return firstValidChild;
        });
        if (firstValidChild) {
          result = firstValidChild.routePath;
        }
      }
      // find upward
      if (!firstValidChild) {
        // check parent
        while (!isPermittedPath(result) && ROOT_PATH != result) {
          result = getParentPath(result);
        }
      }
      return result;
    };

    const pathCheck = (path) => {
      const result = {
        jumpTo: path,
        errMsg: '',
        // isOk: true,
      };
      // remove / at end
      path = path.trim().replace(/\/+$/, '');

      var routeConfig = this.routePathToConfig[path];
      if (routeConfig) {
        // 1. isPermitted check
        if (!isPermittedPath(path)) {
          result.jumpTo = getPermittedPath(path);
        }
        // update routeConfig
        routeConfig = this.routePathToConfig[result.jumpTo];
        // 2. disable check
        const DISABLE_MAP = {
          'NO_APP': '当前团队应用数为零。请先创建应用，才能进行后续操作',
          'NOT_SUPPORT_IN_1.X': '正在功能迁移中，1.x团队暂时无法使用该页面。'
        };
        if (routeConfig.hasOwnProperty('meta') && routeConfig.meta.disabled) {
          for (let key in routeConfig.meta.disabled) {
            if (routeConfig.meta.disabled[key]) {
              // jump to '/profile/app' if 'NO_APP'
              if (key === 'NO_APP') {
                result.jumpTo = '/profile/app';
              } else {
                result.jumpTo = '';
              }
              result.errMsg = DISABLE_MAP[key];
              break;
            }
          }
        }
      } else {
        // 404
        result.jumpTo = path;
      }

      return result;
    };

    vueRouter.beforeEach((to, from, next) => {
      // console.log(from);
      // console.log(to);
      // console.log(JSON.stringify(from.path) + ' -> ' + JSON.stringify(to.path));
      this.pathList.push({
        from, to
      });

      const userInfo = Vue.prototype.$storeHelper.userInfo;
      // const role = userInfo.role;
      // 如果是游客，token无效
      // const isGuest = role === 'guest';
      const token = userInfo.token;

      if (token) {
        const result = pathCheck(to.path);
        if (result.errMsg) {
          Vue.prototype.$message.warning(result.errMsg);
        } else {
          this.preRouter = from;
        }
        if (result.jumpTo) {
          if (result.jumpTo == to.path) {
            next();
          } else {
            next(result.jumpTo);
          }
        }
      } else {
        // 发生网络请求时，才进行用户角色（权限）（逻辑）认证
        // const logoutHref = Vue.prototype.$net.getCasLogoutHref();
        // if (logoutHref) {
        //   window.location.href = logoutHref;
        // }
      }
    });
  }
}

const helper = new Helper();
const vueRouter = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: helper.getVueRouterConfig()
});
helper.startRouteFilter(vueRouter);
vueRouter.helper = helper;
Vue.use(VueRouter);

export default vueRouter;