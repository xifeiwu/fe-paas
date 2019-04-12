import Vue from 'vue';

import Store from 'assets/js/store/index';
import StoreHelper from 'assets/js/store/helper';

import netHelper from './net';

import VueConfig from '../config/vue';
new VueConfig({
  netHelper,
  storeHelper: new StoreHelper(Store)
});

// scss file should be placed in dir packages/theme-chalk/src as some relative path is used in .scss file
import 'element-ui/packages/theme-chalk/src/app-terminal.scss';

import APP from './terminal.vue';

import(/* webpackChunkName: "components-docs" */ 'assets/static/components/ele/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({
    render: h => h(APP),
    store: Store
  }).$mount('#app');
});