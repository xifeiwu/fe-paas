import Vue from 'vue';

import {URL_LIST} from './docs/net/url';
import netHelper from './docs/net/net';
import NetConfig from './config/network';

import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  NetConfig
});

import components from './docs/components';
components.install(Vue);

// import Axios from 'axios';
// Vue.prototype.$ajax = Axios;

import 'assets/css/markdown.scss';
import 'assets/css/highlight.scss';
import APP from './docs/docs.vue';


window.vm = new Vue({
  render: h => h(APP),
}).$mount('#app');