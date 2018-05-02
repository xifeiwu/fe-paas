import Vue from 'vue';
import utils from '../assets/js/utils';
Vue.prototype.$utils = utils;

import {URL_LIST} from './net/url';
Vue.prototype.$url = URL_LIST;

import Store from './store';
import VueConfig from './config/vue';
new VueConfig(Vue, Store);

// import GateOne from '../assets/libs/gateone';

import MessageBox from 'element-ui/packages/message-box/index';
Vue.prototype.$alert = MessageBox.alert;
// scss file should be placed in dir packages/theme-chalk/src as some relative path is used in .scss file
import 'element-ui/packages/theme-chalk/src/app-terminal.scss';

import APP from './terminal.vue';
window.vm = new Vue({
  render: h => h(APP),
  store: Store
}).$mount('#app');