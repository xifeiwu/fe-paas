import RouterHelper from 'assets/js/router-helper';

import AppMain from './app/main-v2.vue';
import AppAdd from './app/add-v2.vue';

// service
import serviceList from './service/list.vue';
import serviceDetail from './service/detail.vue';
import serviceAdd from './service/add-v2.vue';
import serviceGray from './service/gray/list.vue';
import serviceGrayAdd from './service/gray/add.vue';

import InstanceMain from './instance/main.vue';

//pipeline
import pipeLine from './pipeline';

// import pipelineAdd from './pipeline/add';
import pipeLineList from "./pipeline/main"
// import pipeLineRecord from "./pipeline/record"
import pipelinePlan from './pipeline/plan'
const [pipelineAdd, pipeLineRecord] = ['./pipeline/add', './pipeline/record'].map(file => {
  return () => import(
    /* webpackChunkName: "chunk-[request][index]" */
    /* webpackMode: "lazy" */
    `${file}`)
});

import DomainMain from './domain/main.vue';
import DomainWhiteList from './domain/white-list.vue';

import LogMain from './log/main.vue';
import LogRun from './log/run.vue';
import LogDeploy from './log/deploy.vue';
import LogCanary from './log/canary.vue';

import MonitorMain from './monitor/main.vue';
// const MonitorMain = () => {
//   return import(
//   /* webpackChunkName: "profileMonitor" */
//   /* webpackMode: "lazy" */
//   './monitor/main.vue')
// };

/** api网关 */
import gatewayList from './gateway/list.vue';
import gatewayAdd from './gateway/add.vue';

/** AccessKey管理 */
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
import MiddlewareMariadbBackupList from './middleware/mariadb/backup-list.vue';

// config-server
import configServerDirList from './config-server/list-dir.vue';
import configServerFileList from './config-server/list-file.vue';

// cdn
const [CdnMain, CdnList, CdnCreate, CdnEdit, CdnPrefetch, CdnStatistics, CdnDashboard] =
      ['CdnMain', 'CdnList', 'CdnCreate', 'CdnEdit', 'CdnPrefetch', 'CdnStatistics', 'CdnDashboard'].map(key => {
  const file = {
    CdnMain: './cdn/main.vue',
    CdnList: './cdn/list.vue',
    CdnCreate: './cdn/create.vue',
    CdnEdit: './cdn/edit.vue',
    CdnPrefetch: './cdn/prefetch.vue',
    CdnStatistics: './cdn/statistics.vue',
    CdnDashboard: './cdn/dashboard.vue',
  }[key];
  return () => import(
    /* webpackChunkName: "chunk-[request][index]" */
    /* webpackMode: "lazy" */
    `${file}`)
});

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
class Helper extends RouterHelper {
  constructor() {
    super();
    this.ROOT_PATH = '/profile';
    this.richRouterConfig = [{
      path: '/profile',
      redirect: '/profile/app',
    }, {
      path: '/profile/app',
      label: '应用管理',
      component: AppMain,
      meta: {
        isPermitted: true,
      },
    }, {
      path: '/profile/app/add',
      label: '创建应用',
      component: AppAdd,
    }, {
      path: '/profile/app/update',
      label: '修改应用',
      component: AppAdd,
    }, {
      path: '/profile/service',
      label: '服务管理',
      redirect: '/profile/service/list',
    }, {
      path: '/profile/service/list/:id(\\d+)?',
      label: '服务列表',
      component: serviceList,
    }, {
      path: '/profile/service/add',
      label: '创建服务',
      component: serviceAdd,
    }, {
      path: '/profile/service/modify',
      label: '修改配置',
      component: serviceAdd,
    },{
      path: '/profile/service/copy',
      label: '复制服务',
      component: serviceAdd,
    }, {
      path: '/profile/service/:id(\\d+)',
      messageShow: true,
      label: '---',
      meta: {
        isPermitted: false,
      },
    }, {
      path: '/profile/service/:id(\\d+)/gray',
      label: '灰度发布',
      component: serviceGray
    }, {
      path: '/profile/service/:id(\\d+)/gray/add',
      label: '创建灰度版本',
      component: serviceGrayAdd
    }, {
      path: '/profile/service/:id(\\d+)/gray/modify',
      label: '修改灰度版本',
      component: serviceGrayAdd
    }, {
      path: '/profile/service/detail',
      label: '服务详情',
      component: serviceDetail
    }, {
      path: '/profile/pipeline',
      label: 'Pipeline',
      component: pipeLine,
      redirect: '/profile/pipeline/list',
      children: [{
        path: 'list',
        // label: '列表',
        component: pipeLineList,
      }, {
        path: 'add',
        label: '添加pipeline',
        component: pipelineAdd
      }, {
        path: 'modify',
        label: '修改配置',
        component: pipelineAdd
      }, {
        path: 'update',
        label: '修改配置',
        component: pipelineAdd
      }, {
        path: 'records',
        label: '执行记录',
        component: pipeLineRecord,
      }, {
        path: 'records/plan',
        label: '执行进度',
        component: pipelinePlan,
      }]
    },{
      path: '/profile/instance',
      label: '实例列表',
      component: InstanceMain,
    }, {
      path: '/profile/domain',
      label: '外网域名',
      component: DomainMain,
    }, {
      path: '/profile/domain/white-list',
      label: '关联IP白名单',
      component: DomainWhiteList,
    }, {
      path: '/profile/log',
      // label: '审批管理',
      component: LogMain,
      redirect: '/profile/log/run',
      children: [{
        path: 'run',
        label: '运行日志',
        component: LogRun,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'deploy',
        label: '部署日志',
        component: LogDeploy,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'canary',
        label: '完成灰度发布日志',
        component: LogCanary,
        meta: {
          keepAlive: true
        }
      }]
    },
      {
      path: '/profile/monitor',
      label: '实例监控',
      component: MonitorMain,
    },
      {
      path: '/profile/oauth',
      // label: '权限管理',
      component: OAuthMain,
      redirect: '/profile/oauth/key',
      children: [{
        path: 'key',
        label: 'ClientId列表',
        component: OAuthKey,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'url',
        label: '授权URL',
        component: OAuthURL,
        meta: {
          keepAlive: true
        }
      }]
    }, {
      path: '/profile/gateway',
      label: 'API网关',
      redirect: '/profile/gateway/list',
    }, {
      name: 'gateway_list',
      label: '列表',
      path: '/profile/gateway/list',
      component: gatewayList
    }, {
      path: '/profile/gateway/add',
      label: '添加',
      component: gatewayAdd
    }, {
      name: 'gateway_modify',
      label: '修改',
      path: '/profile/gateway/:name/modify',
      component: gatewayAdd
    }, {
      name: 'gateway_detail',
      label: '详情',
      path: '/profile/gateway/:name/detail',
      component: gatewayAdd
    }, {
      path: '/profile/work-order',
      // label: '审批管理',
      component: WorkOrderMain,
      redirect: '/profile/work-order/todo',
      children: [{
        path: 'todo',
        label: '待办工单',
        component: WorkOrderToDo,
      }, {
        path: 'list',
        label: '工单列表',
        component: WorkOrderList,
      }]
    }, {
      path: '/profile/work-order/todo/add',
      label: '申请工单',
      component: WorkOrderAdd,
    }, {
      path: '/profile/work-order/todo/modify',
      label: '修改工单',
      component: WorkOrderAdd,
    }, {
      path: '/profile/work-order/todo/deploy',
      label: '部署工单',
      component: WorkOrderDeploy,
    }, {
      path: '/profile/work-order/todo/test',
      label: '测试工单',
      component: WorkOrderTest,
    }, {
      path: '/profile/work-order/todo/accept',
      label: '验收工单',
      component: WorkOrderAccept,
    }, {
      path: '/profile/middleware',
      // label: '中间件',
      component: Middleware,
      children: [{
        path: 'mariadb',
        label: 'Mariadb服务',
        component: MiddlewareMariadb,
      }, {
        path: 'mariadb/add',
        label: '申请MariaDB服务',
        component: MiddlewareMariadbAdd,
      }, {
        path: 'mariadb/modify',
        label: '修改MariaDB服务',
        component: MiddlewareMariadbAdd,
      }, {
        path: 'mariadb/history',
        label: '操作历史',
        component: MiddlewareMariadbHistory,
      }, {
	      path: 'mariadb/backup-list',
	      label: '备份列表',
	      component: MiddlewareMariadbBackupList,
      }, {
        path: 'mariadb/backup',
        label: '备份与恢复',
        component: MiddlewareMariadbBackup,
      }, {
        path: 'redis',
        label: 'Redis实例',
        component: middlewareRedis
      }, {
        path: 'redis/add',
        label: '申请实例',
        component: middlewareRedisAdd
      }, {
        path: 'redis/modify',
        label: '修改配置',
        component: middlewareRedisModify
      }]
    }, {
      path: '/profile/config-server',
      label: '配置中心',
      component: configServerDirList
    }, {
      path: '/profile/config-server/:id(\\d+)',
      messageShow: true,
      label: '---',
      meta: {
        isPermitted: false,
      },
    }, {
      path: '/profile/config-server/:id(\\d+)/list',
      label: '配置文件列表',
      component: configServerFileList,
    }, {
      path: '/profile/cdn',
      label: 'cdn加速',
      component: CdnMain,
      children: [
        {
          path: 'list',
          label: '加速域名列表',
          component: CdnList,
        },
        {
          path: 'create',
          label: '创建加速域名',
          component: CdnCreate,
        },
        {
          path: 'edit',
          label: '修改配置',
          component: CdnEdit,
        },
        {
          path: 'prefetch',
          label: '刷新预取',
          component: CdnPrefetch,
        },
        {
          path: 'statistics',
          label: '统计分析',
          component: CdnStatistics,
        },
        {
          path: 'dashboard',
          label: '统计分析',
          component: CdnDashboard,
        },
      ]
    }, {
      path: '/profile/image/repo',
      label: '镜像仓库',
      component: ImageList,
    },
    //   {
    //   path: '/profile/image/:id/list',
    //   label:'镜像详情',
    //   component: ImageDetail,
    // },
      {
        path: '/profile/image/repo/version',
        label:'镜像版本',
        component: ImageVersion,
      }
    ];

    /**
     * imediately invoke function
     * traverse router config tree to add routerPath to all component:
     * routerPath = parent.path + path, it is the full path of hash in url
     * @param path
     * @param component
     */
    (() => {
      function updateItem(path, item) {
        if (null !== path) {
          item.fullPath = path + '/' + item.path;
        } else {
          item.fullPath = item.path;
        }
        let keys = [];
        item.pathReg = pathToRegexp(item.fullPath, keys);
        item.pathReg.keys = keys;
        item.toPath = pathToRegexp.compile(item.fullPath);
      }

      function traverseComponent(path, component) {
        if (Array.isArray(component)) {
          component.forEach(traverseComponent.bind(this, path));
        } else if ('object' === typeof(component)) {
          updateItem.call(this, path, component);
          if (component.hasOwnProperty('children')) {
            traverseComponent(component.fullPath, component['children']);
          }
        }
      }
      traverseComponent(null, this.richRouterConfig);
    })();
    // console.log(this.routeList);

    // this.startRouteFilter();

    const pages = {};
    this.routeList.forEach(it => {
      pages[it.fullPath] = it;
    });
    if (this.pages) {
      this.pages = Object.assign(this.pages, pages);
    } else {
      this.pages = pages;
    }

    this.preRouter = null;
  }

  get routeList() {
    return this.richRouterConfig.reduce((routeList, item) => {
      routeList = routeList.concat(item);
      if (item.hasOwnProperty('children')) {
        routeList = routeList.concat(item.children);
      }
      return routeList;
    }, []);
  }

  // filter out useless config in richRouterConfig
  getConfig4VueRouter() {
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

  // 遍历配置
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

  getConfigByRoutePath(path) {
    return this.routeList.find(it => it.pathReg.test(path));
  }

  getConfigByFullPath(path) {
    return this.routeList.find(it => it.fullPath == path);
  }

  /**
   * add prop isPermitted to all item in richRouteConfig. called by:
   * 1. constructor of this class
   * 2. created of profile.vue
   * @param permissionMap: {'/app': true, '/oauth/key': true}
   */
  addPermission(notPermittedList) {
    function updateItem(item) {
      if (item.hasOwnProperty('fullPath')) {
        if (!item.hasOwnProperty('meta')) {
          item.meta = {};
        }
        item.meta['isPermitted'] = notPermittedList.indexOf(item.fullPath) > -1 ? false : true;
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
      if (item.hasOwnProperty('fullPath')) {
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
            if (isPathMatch(item['fullPath'])) {
            } else {
              item.meta['disabled'][key] = value;
            }
            break;
          case 'include':
            if (isPathMatch(item['fullPath'])) {
              item.meta['disabled'][key] = value;
            } else {
            }
            break;
        }
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
  }

  /**
   * get permitted children in routeConfig by fullPath
   * @param fullPath, such as '/log', '/oauth'
   * @returns {Array}
   * TODO: change name to getSubRouteList
   */
  getPermittedSubRouteList(fullPath) {
    const target = this.richRouterConfig.find(it => it.fullPath == fullPath);
    if (target && target.hasOwnProperty('children')) {
      return target['children'];
    } else {
      return [];
    }
  }

  // get parent path of the path
  getParentPath (path) {
    var result = '';
    if (!path.startsWith(this.ROOT_PATH)) {
      result = this.ROOT_PATH;
    } else {
      result = path.split('/').slice(0, -1).join('/');
      if (!result) {
        result = this.ROOT_PATH;
      }
    }
    return result;
  }

  // if the path is valid
  isPermitted (config) {
    var permitted = true;
    if (!config) {
      permitted = false;
    } else if (config.hasOwnProperty('meta') && config.meta.hasOwnProperty('isPermitted')) {
      permitted = config.meta.isPermitted;
    }
    return permitted;
  };


  // get nearest path if the path is not valid
  getPermittedPath (config) {
    var path = config.fullPath;
    // check parent
    while (!this.isPermitted(config) && this.ROOT_PATH != path) {
      path = this.getParentPath(path);
      config = this.getConfigByRoutePath(path);
    }
    return path;
  }

  goUp(path) {
    var targetPath = this.getParentPath(path);
    if (targetPath.startsWith(this.ROOT_PATH)) {
      return this.ROOT_PATH;
    }
    var routeConfig = this.getConfigByRoutePath(targetPath);
    targetPath = this.getPermittedPath(routeConfig);
    return targetPath;
  }
  /**
   * do some action before route change
   */
  startRouteFilter(vueRouter) {

    const pathCheck = (path) => {
      // remove / at end
      path = path.trim().replace(/\/+$/, '');
      const result = {
        jumpTo: path,
        errMsg: '',
        // isOk: true,
      };

      var routeConfig = this.getConfigByRoutePath(path);
      if (routeConfig) {
        // 1. isPermitted check
        if (!this.isPermitted(routeConfig)) {
          result.jumpTo = getPermittedPath(routeConfig);
        }
        // update routeConfig
        routeConfig = this.getConfigByRoutePath(result.jumpTo);
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
  routes: helper.getConfig4VueRouter()
});
helper.startRouteFilter(vueRouter);
vueRouter.helper = helper;
Vue.use(VueRouter);

export default vueRouter;