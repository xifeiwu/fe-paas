/**
 * entry file for vue project, notice the init sequence of component, or error maybe occur
 * 1. Store: set vuex store
 * 2. VueConfig: add mixin and prototype function for Vue
 * 3. NetWorkConfig: add request and response interceptors for ajax
 * 4. RouterConfig: vue router config, add route filter
 */

import Vue from 'vue';

import Store from './profile/store';
import StoreHelper from './profile/store/store-helper';

import {URL_LIST} from './profile/net/url';
import netHelper from './profile/net/net';
import NetConfig from './config/network';

import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(Store),
  NetConfig
});

import RouterConfig from './profile/router';
let routerConfig = new RouterConfig(Vue);

// my-icons for icon and svg
import '$assets/css/fonts/my-icons.css';
import '$assets/css/fonts/my-icons.js';

import APP from './profile/pages/app';

import(/* webpackChunkName: "components-basic" */ 'assets/libs/components/basic.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: routerConfig.vueRouter,
    store: Store
  }).$mount('#app');
});

window.Vue = Vue;
// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })