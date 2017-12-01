import Vue from 'vue';
import Axios from 'axios';
import APP from './app';
import router from './route.config';

import '../assets/css/fix_style.scss';
import '../packages/theme-chalk/src/index.scss';
import Components from './components.js';

Axios.defaults.withCredentials = true;
Vue.prototype.$ajax = Axios;

Components.install(Vue);

new Vue({ // eslint-disable-line
  render: h => h(APP),
  router
}).$mount('#app');

// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })