import Vue from 'vue';

import store from './store';
import StoreHelper from './store/helper';

import {URL_LIST} from './net/url';
import netHelper from './net/net';
import NetConfig from '../config/network';

import VueConfig from '../config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(store),
  NetConfig,
});

import APP from './login.vue';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    store: store
  }).$mount('#app');
});

// window.vm = new Vue({
//   render: h => h(APP),
// }).$mount('#app');