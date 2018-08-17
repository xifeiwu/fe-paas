import Vue from 'vue';

import netHelper from './net';

import VueConfig from '../config/vue';
new VueConfig({
  netHelper
});

import APP from './index.vue';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
  }).$mount('#app');
});