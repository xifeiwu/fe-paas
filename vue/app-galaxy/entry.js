import Vue from 'vue';
import axios from 'axios';
import VueRouter from 'vue-router';
import APP from './app';
import routes from './route.config';
console.log(routes);

import '../assets/css/fix_style.scss';
import '../packages/theme-chalk/src/index.scss';
import Components from './components.js';

Vue.prototype.$ajax = axios;
Components.install(Vue);

Vue.use(VueRouter);
const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
});

new Vue({ // eslint-disable-line
  render: h => h(APP),
  router
}).$mount('#app');

// new Vue({
//     el: '#app',
//     render: h => h(APP),
//   router
// })