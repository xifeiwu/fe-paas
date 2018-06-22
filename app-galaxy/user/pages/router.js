import Vue from 'vue';
import VueRouter from 'vue-router';


import UserInfo from './user/info.vue';
import UserOperaion from './user/operation.vue';
import ManageGroup from './user/group.vue';

class Router {
  constructor() {
    this._routes = [{
        path: '/',
        redirect: '/group'
      },
      {
        path: '/info',
        name: '用户信息',
        component: UserInfo,
      }, {
        path: '/operation',
        name: '操作记录',
        component: UserOperaion
      }, {
        path: '/group',
        name: '团队管理',
        component: ManageGroup
      }
    ];
    this.vueRouter = new VueRouter({
      mode: 'hash',
      routes: this._routes
    });
    Vue.use(VueRouter);
    this.startRouteFilter();
  }

  isValidURL(path) {
    let isValid = false;
    this._routes.some(it => {
      isValid = it.path === path;
      return isValid;
    })
    return isValid;
  }

  getValidURL(path) {
    return '/'
  }

  startRouteFilter() {
    this.vueRouter.beforeEach((to, from, next) => {
      let token = Vue.prototype.$storeHelper.getUserInfo('token');
      if (token) {
        if (!this.isValidURL(to.path)) {
          next(this.getValidURL(to.path));
        } else {
          next();
        }
      } else {
        Vue.prototype.$utils.goToPath('/login?to=/profile');
      }
    });
  }
}

var router = new Router();
export default router;