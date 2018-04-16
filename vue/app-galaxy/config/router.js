/**
 * Created by xifei.wu on 2017/11/28.
 *
 * the format of vue route config
 *
 * 1, some notice
 * 1.1, if component is require by variable, the format should be require(`../pages/${kk}`) other than require(kk)
 * 1.2, the vue page should be export in the way as: export default {}
 *
 * 2, code demo:
 * var kk = '../pages/login.vue';
 * var kk = 'login.vue';
 * let indexRoute = {
 *    path: '/login',
 *    name: 'login',
 *    component: require(`../pages/${kk}`).default,
 *  };
 * let profileRoute = {
 *    path: '/profile',
 *    name: 'profile',
 *    redirect: '/profile/app_manager',
 *    meta: {
 *      requireAuth: true
 *    }
 *    component: require('../pages/profile.vue').default,
 *    children: [{
 *      path: 'app_manager',
 *      name: 'app_manager',
 *      component: require('../pages/profile/app_manager.vue').default
 *    }]
 *  };
 * let routeConfig = [indexRoute, profileRoute];
 *
 */

import VueRouter from 'vue-router';
import routerUtils from '../pages/route';

class RouterConfig {
  constructor(Vue) {
    this.Vue = Vue;
    this.componentConfig = routerUtils.componentList;
    this.allRouterPath = routerUtils.getAllRouterPath();
    // console.log(this.componentConfig);
    let routeConfig = this.generateMiscRoutes();
    this.vueRouter = new VueRouter({
      mode: 'hash',
      base: __dirname,
      routes: routeConfig
    });
    Vue.use(VueRouter);
    this.routerFilter();
  }

  generateMiscRoutes() {
    let vueRouteConfig = {};
    this.traverseComponent(this.componentConfig, vueRouteConfig);
    let configList = []
    for (let key in vueRouteConfig) {
      configList.push(vueRouteConfig[key]);
    }
    return configList;
  };

  /**
   * generate vueComConfig by config from pages/router.js. deep copy
   * @param component, router info from pages/route.js
   * @param vueComConfig, vue router config
   */
  traverseComponent(component, vueComConfig) {
    // property filter
    function generateItem(item) {
      let keysMap = {
        path: 'path',
        name: 'name',
        redirect: 'redirect',
        component: 'component',
        meta: 'meta'
      };
      let result = {};
      for (let key in item) {
        if (item.hasOwnProperty(key) && key in keysMap) {
          if ('componentFile' === key) {
            // result[keysMap[key]] = this.load(item[key]);
          } else {
            result[keysMap[key]] = item[key];
          }
        }
      }
      return result;
    }
    if ('object' === typeof(component)) {
      for (let key in component) {
        if (component.hasOwnProperty(key)) {
          let item = component[key];
          vueComConfig[key] = generateItem.call(this, item);
          if ('children' in item) {
            vueComConfig[key].children = [];
            this.traverseComponent(item.children, vueComConfig[key].children);
          }
        }
      }
    } else if (Array.isArray(component)){
      vueComConfig = component.map(generateItem.bind(this));
    }
  }

  /**
   * do some action before route change
   */
  routerFilter() {
    let self = this;
    // if the url is valid
    function isValidateURL(url) {
      return self.allRouterPath.indexOf(url) > -1;
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
        result = '/profile';
      }
      return result;
    }

    this.vueRouter.beforeEach((to, from, next) => {
      console.log('in beforeEach');
      console.log(JSON.stringify(to.path) + ' -> ' + JSON.stringify(from.path));

      // check if the url exist in routerPath list, get the nearest url if current url is not valid.
      if (!isValidateURL(to.path)) {
        next(getValidateURL(to.path));
      } else {
        // login check
        // let token = localStorage.getItem('token');
        let token = this.Vue.prototype.$storeHelper.getUserInfo('token');
        if (token) {//如果有就直接到首页
          if (to.path == '/login') {
            next('/profile');
          } else {
            next();
          }
        } else if (/^\/profile/.test(to.path)){
          if (to.path == '/login') {//如果是登录页面路径，就直接next()
            next();
          } else {//不然就跳转到登录；
            next('/login');
          }
        } else {
          next();
        }
      }
    });
  }

}

// let routerConfig = new RouterConfig();

export default RouterConfig;
