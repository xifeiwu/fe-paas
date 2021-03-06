import Vue from 'vue';

import Store from 'assets/js/store/index';
import StoreHelper from 'assets/js/store/helper';

import {URL_LIST} from './net/url';
import VueConfig from '../config/vue';
new VueConfig({
  URL_LIST,
  storeHelper: new StoreHelper(Store)
});

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