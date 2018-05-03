import Vue from 'vue';

import Store from './store';
import {URL_LIST} from './docs/net/url';
import NetHelper from './docs/net/net';
import VueConfig from './config/vue';
new VueConfig(Vue, Store, URL_LIST, NetHelper);

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