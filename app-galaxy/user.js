import Vue from 'vue';

import Store from '$assets/js/store';
import StoreHelper from './user/store/store-helper';

import {URL_LIST} from './user/net/url';
import netHelper from './user/net/net';
import NetConfig from './config/network';

import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(Store),
  NetConfig,
});

import '$assets/css/fonts/paas-icon.css';
import '$assets/css/fonts/paas-icon.js';

import APP from './user/pages/user.vue';
import routerConfig from './user/pages/router';
Vue.prototype.$routeHelper = routerConfig;

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/profile.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: routerConfig.vueRouter,
    store: Store
  }).$mount('#app');
});
