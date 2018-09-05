import appMain from './app.vue';
import analyzeAppCount from './analyze/app-count.vue';
import analyzeAppDeploy from './analyze/app-deploy.vue';

import Vue from 'vue';
import VueRouter from 'vue-router';

/**
 * router config:
 * 1. path should have the same name as .vue file
 * 2. as limited by webpack require context, componentFile is the path under dir ../pages
 * 3. url path should be correspond with page logic, as it is used for breadcrumb. such as
 *    if add app is sub page of app, its url should be app/add
 */
var Router = function () {
  this.richRouterConfig = [{
    path: '/manage',
    redirect: '/manage/app',
  }, {
    path: '/manage/app',
    component: appMain
  }, {
    path: '/manage/analyze/app-count',
    component: analyzeAppCount
  }, {
    path: '/manage/analyze/app-deploy',
    component: analyzeAppDeploy
  }];

  this.addRoutePath(null, this.richRouterConfig);

  this.vueRouter = new VueRouter({
    mode: 'history',
    base: __dirname,
    // routes: routeConfig,
    routes: this.getVueRouterConfig()
  });
  Vue.use(VueRouter);

  // this.routePathList = this.getAllRouterPath();
  this.routePathToConfig = this.getRoutePathToConfig();

  setTimeout(() => {
    // add permission by config from localStorage
    // this.addPermission(Vue.prototype.$storeHelper.notPermitted);
  });
  // this.startRouteFilter()
};

Router.prototype = {
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
  },

  /**
   * add prop isPermitted to all item in richRouteConfig. called by:
   * 1. constructor of this class
   * 2. created of profile.vue
   * @param permissionMap: {'/app': true, '/oauth/key': true}
   */
  addPermission(permissionMap) {
    // console.log(permissionMap);
    function updateItem(item) {
      if (item.hasOwnProperty('routePath')) {
        if (!item.hasOwnProperty('meta')) {
          item.meta = {};
        }
        item.meta['isPermitted'] = !permissionMap[item.routePath];
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
  },

  // filter out useless config in richRouterConfig
  getVueRouterConfig() {
    function updateItem(item) {
      let keysMap = {
        path: 'path',
        name: 'name',
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
  },

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
  },


  getRoutePathToConfig() {
    let result = {};

    function updateItem(item) {
      if (item.hasOwnProperty('routePath') && item.routePath) {
        result[item.routePath] = item;
      }
    }

    this.traverseComponent(updateItem, this.richRouterConfig);
    return result;
  },

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
  },

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
      // console.log(config);
      // console.log(`${path}, ${isOk}`);
      return isOk;
    }

    // get parent path of the path
    function getParentPath(path) {
      return path.split('/').slice(0, -1).join('/');
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
        result = '/';
      }
      return result;
    }

    this.vueRouter.beforeEach((to, from, next) => {
      // console.log(from);
      // console.log(to);
      // console.log(JSON.stringify(from.path) + ' -> ' + JSON.stringify(to.path));

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

var router = new Router({
  mode: 'history'
});
export default router;