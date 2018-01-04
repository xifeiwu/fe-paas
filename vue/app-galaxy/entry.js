import Vue from 'vue';
import APP from './app';

Vue.mixin({
  methods: {
    $refresh: function () {
      this.$router.go({
        path: this.$route.path,
        force: true
      })
    }
  }
});

import URL from './net/url';
Vue.prototype.$url = URL;

import NetWorkConfig from './config/network';
Vue.prototype.$ajax = NetWorkConfig;

import NetData from './net/net';
Vue.prototype.$net = NetData;

import router from './config/router';
import store from './store';

import '../packages/theme-chalk/src/index.scss';
import '../assets/css/fix_style.scss';
import Components from './components.js';

import utils from './utils';
Vue.prototype.$utils = utils;

Components.install(Vue);

window.vm = new Vue({ // eslint-disable-line
  render: h => h(APP),
  router,
  store
}).$mount('#app');

// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })