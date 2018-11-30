import Vue from 'vue';

import netHelper from './net';

import VueConfig from '../config/vue2';
new VueConfig({
  netHelper,
});

import '$assets/css/markdown-github.css';
import '$assets/css/highlight.scss';
import APP from './pages/index.vue';

import router from './pages/router';

import '$assets/libs/components/element-ui-fix.scss';
import(/* webpackChunkName: "components-docs" */ 'assets/static/components/ele/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
    router: router,
  }).$mount('#app');
});