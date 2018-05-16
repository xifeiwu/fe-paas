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


import APP from './user/pages/user.vue';
import router from './user/pages/router';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router,
    store: Store
  }).$mount('#app');
});
