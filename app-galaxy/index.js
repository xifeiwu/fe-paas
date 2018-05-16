import Vue from 'vue';

import VueConfig from './config/vue';
new VueConfig({
});

import components from './index/components';
components.install(Vue);
import APP from './index/index.vue';
window.vm = new Vue({
  render: h => h(APP),
}).$mount('#app');

// import(/* webpackChunkName: "components-basic" */ 'assets/libs/components/basic.js').then(components => {
//   components.default.install(Vue);
//   window.vm = new Vue({
//     render: h => h(APP),
//   }).$mount('#app');
// });
