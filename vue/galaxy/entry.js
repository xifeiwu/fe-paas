import Vue from 'vue';
import VueRouter from 'vue-router';
import APP from './app';
import routes from './route.config';
console.log(routes);
// import App from './pages/login_2.vue';

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