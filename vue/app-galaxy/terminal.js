import Vue from 'vue';
import utils from '../assets/js/utils';
Vue.prototype.$utils = utils;

import GateOne from '../assets/libs/gateone';

import APP from './terminal.vue';
window.vm = new Vue({
  render: h => h(APP),
}).$mount('#app');