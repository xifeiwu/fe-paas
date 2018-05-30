import Vue from 'vue';

import Store from '$assets/js/store';
import StoreHelper from '$assets/js/store/helper';

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

import '$assets/css/fonts/my-icons.css';
import '$assets/css/fonts/my-icons.js';

import APP from './user/pages/user.vue';
import RouterConfig from './user/pages/router';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: new RouterConfig(Vue).getVueRouter(),
    store: Store
  }).$mount('#app');
});
