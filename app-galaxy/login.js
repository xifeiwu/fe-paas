import Vue from 'vue';

import Store from '$assets/js/store';
import StoreHelper from '$assets/js/store/helper';

import {URL_LIST} from './login/net/url';
import netHelper from './login/net/net';
import NetConfig from './config/network';

import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(Store),
  NetConfig,
});

// import components from './docs/components';
// components.install(Vue);

import APP from './login/login.vue';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    store: Store
  }).$mount('#app');
});

// window.vm = new Vue({
//   render: h => h(APP),
// }).$mount('#app');