import Vue from 'vue';

import Store from './store';
import StoreHelper from './store/store-helper';

import {URL_LIST} from './net/url';
import netHelper from './net/net';

import VueConfig from '../config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
  storeHelper: new StoreHelper(Store),
});

import 'assets/css/fonts/paas-icon.css';
import 'assets/css/fonts/paas-icon.js';

import APP from './pages/index.vue';
import routerConfig from './pages/router';
Vue.prototype.$routeHelper = routerConfig;

import 'assets/libs/element-ui/fix.scss';
import(/* webpackChunkName: "components-docs" */ 'assets/static/components/ele/profile.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: routerConfig.vueRouter,
    store: Store
  }).$mount('#app');
});
