import Vue from 'vue';
import APP from './app';
import NetWork from './config/network'
import router from './config/router';
import store from './store';

import '../assets/css/fix_style.scss';
import '../packages/theme-chalk/src/index.scss';
import Components from './components.js';

Vue.prototype.$ajax = NetWork;

Components.install(Vue);

new Vue({ // eslint-disable-line
  render: h => h(APP),
  router,
  store
}).$mount('#app');

// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })