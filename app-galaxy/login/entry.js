import Vue from 'vue';

import store from './store';
import StoreHelper from './store/helper';

import netHelper from './net';

import VueConfig from '../config/vue';
new VueConfig({
  netHelper,
  storeHelper: new StoreHelper(store),
});

import APP from './login.vue';

import '$assets/css/mixin.scss';
import '$assets/static/libs/highlight/styles/atelier-forest-light.css';

import '$assets/libs/components/element-ui-fix.scss';
import(/* webpackChunkName: "components-docs" */ 'assets/static/components/ele/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    store: store
  }).$mount('#app');
});

// window.vm = new Vue({
//   render: h => h(APP),
// }).$mount('#app');