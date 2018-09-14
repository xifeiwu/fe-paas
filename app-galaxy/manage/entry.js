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

import netHelper from './net';

import VueConfig from '../config/vue';

new VueConfig({
  netHelper,
  storeHelper: new StoreHelper(),
});

import routerConfig from './pages/router';

Vue.prototype.$routeHelper = routerConfig;

// paas-icons for icon and svg
import 'assets/css/fonts/paas-icon.css';
import 'assets/css/fonts/paas-icon.js';

import APP from './pages/index';

import(/* webpackChunkName: "components-profile" */ 'assets/libs/components/profile.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: routerConfig.vueRouter,
    store: store
  }).$mount('#app');
});

window.Vue = Vue;
