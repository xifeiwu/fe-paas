import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);


import UserInfo from './user/info.vue';
import UserOperaion from './user/operation.vue';
import ManageGroup from './user/group.vue';

export default class RouterConfig {
  constructor(Vue) {
    this.Vue = Vue;
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
    this._vueRouter = new VueRouter({
      mode: 'hash',
      routes: this._routes
    });
    this.startRouteFilter();
  }

  getVueRouter() {
    return this._vueRouter;
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
    this._vueRouter.beforeEach((to, from, next) => {
      let token = this.Vue.prototype.$storeHelper.getUserInfo('token');
      if (token) {
        if (!this.isValidURL(to.path)) {
          next(this.getValidURL(to.path));
        } else {
          next();
        }
      } else {
        this.Vue.prototype.$utils.goToPath('/login?to=/profile');
      }
    });
  }
}