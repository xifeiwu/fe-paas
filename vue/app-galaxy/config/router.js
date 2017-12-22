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

import Vue from 'vue';
import VueRouter from 'vue-router';
import routerUtils from '../pages/route';

class RouterConfig {
  constructor() {
    this.componentConfig = routerUtils.componentList;
    this.allRouterPath = routerUtils.getAllRouterPath();
    let routeConfig = this.generateMiscRoutes();
    this.vueRouter = new VueRouter({
      mode: 'hash',
      base: __dirname,
      routes: routeConfig
    });
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


  // load(pathInPages) {
  //   return require(`../pages/${pathInPages}.vue`).default;
  // }
  //
  // /* unused */
  // load2(path) {
  //   return function(r) {
  //     require.ensure(
  //       [],
  //       function() {
  //         r(require(path))
  //       },
  //       'bundle'
  //     )
  //   }
  // }

  /**
   * generate vueComConfig by component. deep copy
   * @param component, router info from pages/route.js
   * @param vueComConfig, vue router config
   */
  traverseComponent(component, vueComConfig) {
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

  routerFilter() {
    let self = this;
    function getParentPath(url) {
      return url.split('/').slice(0,-1).join('/');
    }
    function isValidateURL(url) {
      return self.allRouterPath.indexOf(url) > -1;
    }
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
        let token = localStorage.getItem('token');
        if (token) {//如果有就直接到首页咯
          next();
        } else {
          if (to.path == '/login') {//如果是登录页面路径，就直接next()
            next();
          } else {//不然就跳转到登录；
            next('/login');
          }
        }
      }
      //  if (to.meta.requireAuth) {
      //   fetch('m/is/login').then(res = > {
      //    if (res.errCode == 200) {
      //     next();
      //    } else {
      //     if (getCookie('session')) {
      //      delCookie('session');
      //     }
      //     if (getCookie('u_uuid')) {
      //      delCookie('u_uuid');
      //     }
      //     next({
      //      path: '/'
      //     });
      //    }
      //   });
      //  } else {
      //   next();
      //  }
    });
  }

}

Vue.use(VueRouter);
let routerConfig = new RouterConfig();
routerConfig.routerFilter();


export default routerConfig.vueRouter;
