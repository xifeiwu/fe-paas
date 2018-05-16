var path = require('path');
// import Login from './login.vue';
import Profile from './profile.vue';
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

import User from './user.vue';
import UserInfo from './user/info.vue';
import UserOperaion from './user/operation.vue';

/**
 * router config:
 * 1. path should have the same name as .vue file
 * 2. as limited by webpack require context, componentFile is the path under dir ../pages
 * 3. url path should be correspond with page logic, as it is used for breadcrumb. such as
 *    if add app is sub page of app, its url should be app/add
 */
var Router = function () {
  this.componentList = {
    // 'login': {
    //   path: '/login',
    //   name: '登录',
    //   component: Login,
    // },
    'profile': {
      path: '/profile',
      name: '详情',
      component: Profile,
      redirect: '/profile/app',
      children: [{
        path: 'app',
        name: '应用管理',
        component: AppMain,
      }, {
        path: 'app/add',
        name: '创建应用',
        component: AppAdd,
      }, {
        path: 'service',
        name: '服务管理',
        component: ServiceMain,
      }, {
        path: 'service/add',
        name: '添加服务',
        component: ServiceAdd,
      }, {
        path: 'instance',
        name: '实例列表',
        component: InstanceMain,
      }, {
        path: 'domain',
        name: '外网域名',
        component: DomainMain,
      }, {
        path: 'domain/white-list',
        name: '关联IP白名单',
        component: DomainWhiteList,
      }, {
        path: 'log',
        // name: '审批管理',
        component: LogMain,
        redirect: 'log/run',
        children: [{
          path: 'run',
          name: '运行日志',
          component: LogRun,
          meta: {keepAlive: true}
        },{
          path: 'deploy',
          name: '部署日志',
          component: LogDeploy,
          meta: {keepAlive: true}
        }]
      }, {
        path: 'monitor',
        name: '应用监控',
        component: MonitorMain,
      }, {
        path: 'oauth',
        // name: '权限管理',
        component: OAuthMain,
        redirect: 'oauth/key',
        children: [{
          path: 'key',
          name: 'Access Key管理',
          component: OAuthKey,
          meta: {keepAlive: true}
        },{
          path: 'url',
          name: '授权URL',
          component: OAuthURL,
          meta: {keepAlive: true}
        }]
      }, {
        path: 'work-order',
        // name: '审批管理',
        component: WorkOrderMain,
        redirect: 'work-order/todo',
        children: [{
          path: 'todo',
          name: '待办工单',
          component: WorkOrderToDo,
        },{
          path: 'list',
          name: '工单列表',
          component: WorkOrderList,
        }]
      }, {
        path: 'work-order/todo/add',
        name: '申请工单',
        component: WorkOrderAdd,
      }, {
        path: 'work-order/todo/modify',
        name: '修改工单',
        component: WorkOrderModify,
      }, {
        path: 'work-order/todo/deploy',
        name: '部署工单',
        component: WorkOrderDeploy,
      }, {
        path: 'work-order/todo/test',
        name: '测试工单',
        component: WorkOrderTest,
      }, {
        path: 'work-order/todo/accept',
        name: '验收工单',
        component: WorkOrderAccept,
      }]
    },
    'user': {
      path: '/user',
      name: '详情',
      component: User,
      redirect: '/user/info',
      children: [{
        path: 'info',
        name: '用户信息',
        component: UserInfo,
      }, {
        path: 'operation',
        name: '操作记录',
        component: UserOperaion
      }]
    }
  };
  this.update();
};

Router.prototype = {
  removeVirgule(path) {
    return path.substr(1);
  },

  /**
   * traverse router config tree to add routerPath to all component:
   * routerPath = parent.path + path, it is the full path of hash in url
   * @param path
   * @param component
   */
  generateRouterLinkPath(path, component) {
    function updateItem(item) {
      if (null !== path) {
        item.routerPath = path + '/' + item.path;
      } else {
        item.routerPath = item.path;
      }
    }
    if ('object' === typeof(component)) {
      for (let key in component) {
        if (component.hasOwnProperty(key)) {
          let item = component[key];
          updateItem.call(this, item);
          if ('children' in item) {
            this.generateRouterLinkPath(item.routerPath, item.children);
          }
        }
      }
    } else if (Array.isArray(component)){
      component.forEach(updateItem.bind(this));
    }
  },

  // TODO: not used
  generateComponentFile(component) {
    function updateItem(item) {
      // componentFile is the path under dir ../pages
      item.componentFile = this.removeVirgule(item.routerPath);
    }
    if ('object' === typeof(component)) {
      for (let key in component) {
        if (component.hasOwnProperty(key)) {
          let item = component[key];
          updateItem.call(this, item);
          if ('children' in item) {
            this.generateComponentFile(item.children);
          }
        }
      }
    } else if (Array.isArray(component)) {
      component.forEach(updateItem.bind(this));
    }
  },

  update() {
    this.generateRouterLinkPath(null, this.componentList);
    this.generateComponentFile(this.componentList);
  },

  /**
   * get all routerPath in router config tree. it can be used:
   * 1. check whether current url is validate.
   */
  getAllRouterPath() {
    var routerPath = [];
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath')) {
        routerPath.push(item.routerPath);
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            updateItem.call(this, item);
            if ('children' in item) {
              traverseComponent(item.children);
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          updateItem.call(this, item);
        }
        return null;
      }
    }
    traverseComponent(this.componentList);
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
    var routerPath = {};
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath') && item.hasOwnProperty('name')) {
        if (item.name && item.routerPath) {
          routerPath[item.routerPath] = item.name;
        }
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            updateItem.call(this, item);
            if ('children' in item) {
              traverseComponent(item.children);
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          updateItem.call(this, item);
        }
        return null;
      }
    }
    traverseComponent(this.componentList);
    return routerPath;
  },

  /**
   * get name property of each component by routerPath.
   */
  getNameByRouterPath(routerPath) {
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath') && routerPath === item.routerPath) {
        if (item.hasOwnProperty('name')) {
          return item.name;
        } else {
          return '';
        }
      } else {
        return null;
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            let name = updateItem.call(this, item);
            if (null !== name) {
              return name;
            }
            if ('children' in item) {
              let name = traverseComponent(item.children);
              if (null !== name) {
                return name;
              }
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          let name = updateItem.call(this, item);
          if (null !== name) {
            return name;
          }
        }
        return null;
      }
    }
    let name = traverseComponent(this.componentList);
    return name;
  },
};

var router = new Router();
// console.log(JSON.stringify(router.componentList));
export default router;