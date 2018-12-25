/**
 * entry file for vue project, notice the init sequence of component, or error maybe occur
 * 1. Store: set vuex store
 * 2. VueConfig: add mixin and prototype function for Vue
 * 3. NetWorkConfig: add request and response interceptors for ajax
 * 4. RouterConfig: vue router config, add route filter
 */

import Vue from 'vue';

import store from './store';
import StoreHelper from './store/helper';

import {URL_LIST} from './net/url';
import netHelper from './net/net';

import VueConfig from '../config/vue';

new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(),
});

import router from './pages/router';

// import 'assets/css/bootstrap.scss';

// paas-icons for icon and svg
import 'assets/css/fonts/paas-icon.css';
import 'assets/css/fonts/paas-icon.js';

import APP from './pages/profile';

import 'assets/libs/element-ui/fix.scss';
Promise.all([
  import(/* webpackChunkName: "components-element-ui" */ 'assets/static/components/ele/profile.js'),
  import(/* webpackChunkName: "components-custom" */ 'assets/static/components/custom.js')
]).then(components => {
  components[0].default.install(Vue);
  components[1].default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    store: store,
    router: router,
  }).$mount('#app');
});

window.Vue = Vue;
// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })

/** 全局为每个vue组件混入方法 */
Vue.mixin({
  methods: {
    $toast(title = '操作成功', type= 'success' ,center = true) {
      this.$store.dispatch('toastPush', {title, type, center})
    },
  },
})
