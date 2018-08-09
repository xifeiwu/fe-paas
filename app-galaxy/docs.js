import Vue from 'vue';

import {URL_LIST} from './docs/net/url';
import netHelper from './docs/net/net';

import VueConfig from './config/vue';
new VueConfig({
  URL_LIST,
  netHelper,
});

import 'assets/css/markdown.scss';
import 'assets/css/highlight.scss';
import APP from './docs/docs.vue';

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
  }).$mount('#app');
});