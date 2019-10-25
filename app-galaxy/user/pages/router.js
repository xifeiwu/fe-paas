import Vue from 'vue';
import VueRouter from 'vue-router';

import UserInfo from './info.vue';
import UserMessage from './message.vue';
import UserOperaion from './operation.vue';
import ManageGroup from './group.vue';
import UserGroup from '../../common/group.vue';
import Feedback from './feedback.vue';
import k8sWarning from './k8s-warning.vue';

import pathToRegexp from 'path-to-regexp';

class Helper {
  constructor() {
    this.richRouterConfig = [
      {
        path: '/user',
        redirect: '/user/info'
      },
      {
        path: '/user/info',
        name: '云产品',
        component: UserInfo,
      },
      {
        path: '/user/message',
        name: '消息中心',
        component: UserMessage,
      },
      {
        path: '/user/operation',
        name: '操作记录',
        component: UserOperaion,
      },
      {
        path: '/user/group',
        name: '团队管理',
        component: UserGroup
      },
      {
        path: '/user/feedback',
        name: '反馈建议',
        component: Feedback
      },
      // {
      //   path: '/user/k8s',
      //   name: 'k8s事件报警',
      //   component: k8sWarning
      // }
    ];

    this.vueRouter = new VueRouter({
      mode: 'history',
      routes: this.richRouterConfig
    });
    Vue.use(VueRouter);

    // setTimeout(() => {
    //   // add permission by config from localStorage
    //   this.addPermission(Vue.prototype.$storeHelper.notPermitted);
    // });
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
    const pages = {};
    this.routeList.forEach(it => {
      pages[it.fullPath] = it;
    });
    if (this.pages) {
      this.pages = Object.assign(this.pages, pages);
    } else {
      this.pages = pages;
    }
    this.startRouteFilter();
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
  // addPermission(permissionMap) {
  //   function updateItem(item) {
  //     if (item.hasOwnProperty('routePath')) {
  //       if (!item.hasOwnProperty('meta')) {
  //         item.meta = {};
  //       }
  //       item.meta['isPermitted'] = !permissionMap[item.routePath];
  //     }
  //   }
  //
  //   this.traverseComponent(updateItem, this.richRouterConfig);
  // }

  /**
   * get permitted children in routeConfig by routePath
   * @param routePath, such as '/log', '/oauth'
   * @returns {Array}
   */
  getPermittedSubRouteList() {
    return JSON.parse(JSON.stringify(this.routeList.filter(it => it.hasOwnProperty('name'))));
  }

  /**
   * do some action before route change
   */
  // TODO: not used, need fix
  startRouteFilter() {
    let self = this;
    // if the path is valid
    function isValidateURL(path) {
      // remove / at end
      path = path.trim().replace(/\/+$/, '');
      let isOk = true;
      let config = null;
      if (self.routePathToConfig.hasOwnProperty(path)) {
        config = self.routePathToConfig[path];
      }
      if (!config) {
        isOk = false;
      } else {
        if (config.hasOwnProperty('meta') && config.meta.hasOwnProperty('isPermitted')) {
          isOk = config.meta.isPermitted;
        }
        if (config.hasOwnProperty('children')) {
          isOk = false;
        }
      }
      return isOk;
    }
    // get parent path of the path
    function getParentPath(path) {
      return path.split('/').slice(0,-1).join('/');
    }
    // get nearest path if the path is not valid
    function getValidateURL(path) {
      let result = path;

      let config = null;
      if (self.routePathToConfig.hasOwnProperty(path)) {
        config = self.routePathToConfig[path];
      }
      // check children first
      let firstValidChild = null;
      if (config && config.hasOwnProperty('children')) {
        config.children.some(it => {
          if (isValidateURL(it.routePath)) {
            firstValidChild = it;
          }
          return firstValidChild;
        });
        if (firstValidChild) {
          result = firstValidChild.routePath;
        }
      }
      if (!firstValidChild) {
        // check parent
        while (!isValidateURL(result) && '' != result) {
          result = getParentPath(result);
        }
      }

      if ('' == result) {
        result = '/info';
        // let groupConfig = self.routePathToConfig['/group']
        // if (groupConfig.hasOwnProperty('meta') && groupConfig.meta.hasOwnProperty('isPermitted')
        //   && groupConfig.meta.isPermitted) {
        //   result = '/group';
        // } else {
        //   result = '/info';
        // }
      }
      return result;
    }

    this.vueRouter.beforeEach((to, from, next) => {
      // console.log(from);
      // console.log(to);
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
}

const helper = new Helper();
const vueRouter = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: helper.getConfig4VueRouter()
});
// helper.startRouteFilter(vueRouter);
vueRouter.helper = helper;
Vue.use(VueRouter);

export default vueRouter;
