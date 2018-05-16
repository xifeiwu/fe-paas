import Vue from 'vue';

import VueConfig from './config/vue';
new VueConfig({
});

import APP from './index/index.vue';

// import(/* webpackChunkName: "components-basic" */ 'assets/libs/components/basic.js').then(components => {
//   components.default.install(Vue);
//   window.vm = new Vue({
//     render: h => h(APP),
//   }).$mount('#app');
// });

import(/* webpackChunkName: "components-docs" */ '$assets/libs/components/docs.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({ // eslint-disable-line
    render: h => h(APP),
  }).$mount('#app');
});