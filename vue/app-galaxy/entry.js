/**
 * entry file for vue project, notice the init sequence of component, or error maybe occur
 * 1. Store: set vuex store
 * 2. VueConfig: add mixin and prototype function for Vue
 * 3. NetWorkConfig: add request and response interceptors for ajax
 * 4. RouterConfig: vue router config, add route filter
 */

import Vue from 'vue';

import Store from './store';

import VueConfig from './config/vue';
new VueConfig(Vue, Store);

import NetWorkConfig from './config/network';
new NetWorkConfig(Vue);

import RouterConfig from './config/router';
let routerConfig = new RouterConfig(Vue);

import 'assets/css/fix-style.scss';
// my-icons for icon and svg
import 'assets/css/fonts/my-icons.css';
import 'assets/css/fonts/my-icons.js';

import APP from './pages/app';

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