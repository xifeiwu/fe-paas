import Vue from 'vue';
import VueRouter from 'vue-router';


import UserInfo from './info.vue';
import UserOperaion from './operation.vue';
import ManageGroup from './group.vue';

class Router {
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
      // {
      //   path: '/operation',
      //   name: '操作记录',
      //   component: UserOperaion,
      // },
      {
        path: '/user/group',
        name: '团队管理',
        component: ManageGroup
      }
    ];
    this.addRoutePath(null, this.richRouterConfig);
    this.routePathToConfig = this.getRoutePathToConfig();

    this.vueRouter = new VueRouter({
      mode: 'history',
      routes: this.richRouterConfig
    });
    Vue.use(VueRouter);

    // setTimeout(() => {
    //   // add permission by config from localStorage
    //   this.addPermission(Vue.prototype.$storeHelper.notPermitted);
    // });
    this.startRouteFilter();
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
  addPermission(permissionMap) {
    function updateItem(item) {
      if (item.hasOwnProperty('routePath')) {
        if (!item.hasOwnProperty('meta')) {
          item.meta = {};
        }
        item.meta['isPermitted'] = !permissionMap[item.routePath];
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
  }

  /**
   * get permitted children in routeConfig by routePath
   * @param routePath, such as '/log', '/oauth'
   * @returns {Array}
   */
  getPermittedSubRouteList(routePath) {
    let result = [];
    let routePathToConfig = this.getRoutePathToConfig();
    if (routePath === '/') {
      result = this.richRouterConfig.filter(it => {
        let isPermitted = true;
        if (it.hasOwnProperty('meta') && it.meta.hasOwnProperty('isPermitted')) {
          isPermitted = it.meta.isPermitted;
        }
        return isPermitted;
      })
    } else if (routePathToConfig.hasOwnProperty(routePath) && routePathToConfig[routePath].hasOwnProperty('children')) {
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

  /**
   * do some action before route change
   */
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

var router = new Router({
  mode: 'history'
});
export default router;