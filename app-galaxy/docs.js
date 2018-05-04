import Vue from 'vue';

import Store from './store';
import {URL_LIST} from './docs/net/url';
import netHelper from './docs/net/net';
import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper
});

import NetWorkConfig from './config/network';
new NetWorkConfig(Vue);

import components from './docs/components';
components.install(Vue);

// import Axios from 'axios';
// Vue.prototype.$ajax = Axios;

import APP from './docs/docs.vue';

import 'assets/css/fix-style.scss';

window.vm = new Vue({
  render: h => h(APP),
}).$mount('#app');