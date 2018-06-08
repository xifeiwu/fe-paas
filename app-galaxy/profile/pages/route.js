import AppMain from './profile/app/main.vue';
import AppAdd from './profile/app/add.vue';
import ServiceMain from './profile/service/main.vue';
import ServiceAdd from './profile/service/add.vue';
import InstanceMain from './profile/instance/main.vue';

import DomainMain from './profile/domain/main.vue';
import DomainWhiteList from './profile/domain/white-list.vue';

import LogMain from './profile/log/main.vue';
// const LogMain = () => import(
//   /* webpackChunkName: "log" */
//   /* webpackMode: "lazy" */
//   './profile/log/main.vue');
import LogRun from './profile/log/run.vue';
import LogDeploy from './profile/log/deploy.vue';

import MonitorMain from './profile/monitor/main.vue';

import OAuthMain from './profile/oauth/main.vue';
import OAuthKey from './profile/oauth/key.vue';
import OAuthURL from './profile/oauth/url.vue';

import WorkOrderMain from './profile/work-order/main.vue';
import WorkOrderToDo from './profile/work-order/todo.vue';
import WorkOrderList from './profile/work-order/list.vue';
import WorkOrderAdd from './profile/work-order/todo/add.vue';
import WorkOrderModify from './profile/work-order/todo/modify.vue';
import WorkOrderDeploy from './profile/work-order/todo/deploy.vue';
import WorkOrderAccept from './profile/work-order/todo/accept.vue';
import WorkOrderTest from './profile/work-order/todo/test.vue';


import Vue from 'vue';
import VueRouter from 'vue-router';
/**
 * router config:
 * 1. path should have the same name as .vue file
 * 2. as limited by webpack require context, componentFile is the path under dir ../pages
 * 3. url path should be correspond with page logic, as it is used for breadcrumb. such as
 *    if add app is sub page of app, its url should be app/add
 */
var Router = function() {
  this.richRouterConfig = [{
    path: '/',
    redirect: '/app',
  }, {
    path: '/app',
    name: '应用管理',
    component: AppMain,
    meta: {
      isPermitted: true,
    }
  }, {
    path: '/app/add',
    name: '创建应用',
    component: AppAdd,
  }, {
    path: '/service',
    name: '服务管理',
    component: ServiceMain,
  }, {
    path: '/service/add',
    name: '添加服务',
    component: ServiceAdd,
  }, {
    path: '/instance',
    name: '实例列表',
    component: InstanceMain,
  }, {
    path: '/domain',
    name: '外网域名',
    component: DomainMain,
  }, {
    path: '/domain/white-list',
    name: '关联IP白名单',
    component: DomainWhiteList,
  }, {
    path: '/log',
    // name: '审批管理',
    component: LogMain,
    redirect: '/log/run',
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
  }, {
    path: '/monitor',
    name: '应用监控',
    component: MonitorMain,
  }, {
    path: '/oauth',
    // name: '权限管理',
    component: OAuthMain,
    redirect: 'oauth/key',
    children: [{
      path: 'key',
      name: 'Access Key管理',
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
    path: '/work-order',
    // name: '审批管理',
    component: WorkOrderMain,
    redirect: '/work-order/todo',
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
    path: '/work-order/todo/add',
    name: '申请工单',
    component: WorkOrderAdd,
  }, {
    path: '/work-order/todo/modify',
    name: '修改工单',
    component: WorkOrderModify,
  }, {
    path: '/work-order/todo/deploy',
    name: '部署工单',
    component: WorkOrderDeploy,
  }, {
    path: '/work-order/todo/test',
    name: '测试工单',
    component: WorkOrderTest,
  }, {
    path: '/work-order/todo/accept',
    name: '验收工单',
    component: WorkOrderAccept,
  }];
  this.update();


  this.vueRouter = new VueRouter({
    mode: 'hash',
    base: __dirname,
    // routes: routeConfig,
    routes: this.getVueRouterConfig()
  });
  Vue.use(VueRouter);

  this.routePathList = this.getAllRouterPath();
  this.startRouteFilter()
};

Router.prototype = {
  // filter out useless config in richRouterConfig
  getVueRouterConfig() {
    function updateItem(item) {
      let keysMap = {
        path: 'path',
        name: 'name',
        redirect: 'redirect',
        component: 'component',
        meta: 'meta'
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
  },

  /**
   * traverse router config tree to add routerPath to all component:
   * routerPath = parent.path + path, it is the full path of hash in url
   * @param path
   * @param component
   */
  generateRouterLinkPath() {
    function updateItem(path, item) {
      if (null !== path) {
        item.routerPath = path + '/' + item.path;
      } else {
        item.routerPath = item.path;
      }
    }

    function traverseComponent(path, component) {
      if (Array.isArray(component)) {
        component.forEach(traverseComponent.bind(this, path));
      } else if ('object' === typeof(component)) {
        updateItem.call(this, path, component);
        if (component.hasOwnProperty('children')) {
          traverseComponent(component.routerPath, component['children']);
        }
      }
    }

    traverseComponent(null, this.richRouterConfig);
  },

  update() {
    this.generateRouterLinkPath(null, this.richRouterConfig);
  },

  traverseComponent(func, component) {
    if (Array.isArray(component)) {
      component.forEach(this.traverseComponent.bind(this, func));
    } else if ('object' === typeof(component)) {
      func.call(this, component);
      if (component.hasOwnProperty('children')) {
        this.traverseComponent(func, component['children']);
      }
    }
  },

  /**
   * get all routerPath in router config tree. it can be used:
   * 1. check whether current url is validate.
   */
  getAllRouterPath() {
    let routerPath = [];

    function updateItem(item) {
      if (item.hasOwnProperty('routerPath')) {
        routerPath.push(item.routerPath);
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return routerPath;
  },

  /**
   * get routerPath to name, in the following format:
   * {
   *   '/login': "登录",
   *   '/profile':"详情",
   *   '/profile/app':"应用管理",
   *   '/profile/app/add':"创建应用",
   *   '/profile/domain_name':"外网域名",
   *   '/profile/instance':"实例列表",
   *   '/profile/service':"服务管理"
   *  }
   */
  getRouterPathToName() {
    let routerPath = {};

    function updateItem(item) {
      if (item.hasOwnProperty('routerPath') && item.hasOwnProperty('name')) {
        if (item.name && item.routerPath) {
          routerPath[item.routerPath] = item.name;
        }
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return routerPath;
  },


  /**
   * do some action before route change
   */
  startRouteFilter() {
    let self = this;
    // if the url is valid
    function isValidateURL(url) {
      return self.routePathList.indexOf(url) > -1;
    }
    // get parent path of the url
    function getParentPath(url) {
      return url.split('/').slice(0,-1).join('/');
    }
    // get nearest path if the url is not valid
    function getValidateURL(url) {
      let result = url;
      while(!isValidateURL(result) && '' != result) {
        result = getParentPath(result);
      }
      if ('' == result) {
        result = '/';
      }
      return result;
    }

    this.vueRouter.beforeEach((to, from, next) => {
      // console.log('in beforeEach');
      // console.log(JSON.stringify(to.path) + ' -> ' + JSON.stringify(from.path));

      let token = Vue.prototype.$storeHelper.getUserInfo('token');
      if (token) {
        if (!isValidateURL(to.path)) {
          next(getValidateURL(to.path));
        } else {
          next();
        }
      } else {
        Vue.prototype.$utils.goToPath('/login?to=/profile');
      }
    });
  }
};

var router = new Router();
export default router;