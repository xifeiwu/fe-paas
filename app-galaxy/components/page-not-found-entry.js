/**
 * entry file for vue project, notice the init sequence of component, or error maybe occur
 * 1. Store: set vuex store
 * 2. VueConfig: add mixin and prototype function for Vue
 * 3. NetWorkConfig: add request and response interceptors for ajax
 * 4. RouterConfig: vue router config, add route filter
 */

import Vue from 'vue';

import APP from './page-not-found.vue';

window.vm = new Vue({ // eslint-disable-line
  render: h => h(APP),
}).$mount('#app');

window.Vue = Vue;
