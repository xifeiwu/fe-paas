import Vue from 'vue';
import APP from './index/index.vue';
// import components from './index/components';
// components.install(Vue);

import(/* webpackChunkName: "components-basic" */ 'assets/libs/components/basic.js').then(components => {
  components.default.install(Vue);
  window.vm = new Vue({
    render: h => h(APP),
  }).$mount('#app');
});
