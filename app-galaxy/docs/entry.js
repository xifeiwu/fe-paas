import Vue from 'vue';

import netHelper from './net';

import VueConfig from '../config/vue2';
new VueConfig({
  netHelper,
});

import 'assets/css/markdown-github.css';
import 'assets/css/highlight.scss';
import APP from './docs.vue';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
  }).$mount('#app');
});