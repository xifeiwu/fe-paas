import Vue from 'vue';
import Store from './store';
import utils from './utils';
Vue.prototype.$utils = utils;

import VueConfig from './config/vue';
new VueConfig(Vue, Store);

import NetWorkConfig from './config/network';
Vue.prototype.$ajax = NetWorkConfig;
import router from './config/router';


import URL from './net/url';
Vue.prototype.$url = URL;
import NetData from './net/net';
Vue.prototype.$net = NetData;

import '../packages/theme-chalk/src/index.scss';
import '../assets/css/fix_style.scss';
import Components from './components.js';


Components.install(Vue);

import APP from './app';
window.vm = new Vue({ // eslint-disable-line
  render: h => h(APP),
  router: router,
  store: Store
}).$mount('#app');

// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })