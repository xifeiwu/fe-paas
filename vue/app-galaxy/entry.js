import Vue from 'vue';
import APP from './app';
import NetWorkConfig from './config/network';
Vue.prototype.$ajax = NetWorkConfig;
import NetData from './data';
Vue.prototype.$net = NetData;
import router from './config/router';
import store from './store';

import '../assets/css/fix_style.scss';
import '../packages/theme-chalk/src/index.scss';
import Components from './components.js';


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