import appMain from './app.vue';
import groupPage from '../../common/group';
import analyzeAppCount from './analyze/app-count.vue';
import analyzeAppDeploy from './analyze/app-deploy.vue';
import analyzeResources from './analyze/resources.vue';
import analyzeVisit from './analyze/visit.vue';
import message from './message.vue';
import feedback from './feedback.vue';
import nodeManage from './node-manage.vue';
import clusterDashboard from './cluster-dashboard.vue';

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
      path: '/manage',
      redirect: '/manage/app',
    }, {
      path: '/manage/app',
      component: appMain
    }, {
      path: '/manage/group',
      component: groupPage
    }, {
      path: '/manage/message',
      component: message
    }, {
      path: '/manage/feedback',
      component: feedback
    }, {
      path: '/manage/analyze/app-count',
      component: analyzeAppCount
    }, {
      path: '/manage/analyze/app-deploy',
      component: analyzeAppDeploy
    }, {
      path: '/manage/analyze/resources',
      component: analyzeResources
    }, {
      path: '/manage/node-manage',
      component: nodeManage
    }, {
      path: '/manage/cluster-dashboard',
      component: clusterDashboard
    }, {
      path: '/manage/analyze/visit',
      component: analyzeVisit
    }];

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
  //   // console.log(permissionMap);
  //   function updateItem(item) {
  //     if (item.hasOwnProperty('fullPath')) {
  //       if (!item.hasOwnProperty('meta')) {
  //         item.meta = {};
  //       }
  //       item.meta['isPermitted'] = !permissionMap[item.fullPath];
  //     }
  //   }
  //
  //   this.traverseComponent(updateItem, this.richRouterConfig);
  // }

  /**
   * get permitted children in routeConfig by fullPath
   * @param fullPath, such as '/log', '/oauth'
   * @returns {Array}
   */
  getPermittedSubRouteList(fullPath) {
  }

  /**
   * do some action before route change
   */
  startRouteFilter() {
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
