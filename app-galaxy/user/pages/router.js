import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);


import UserInfo from './user/info.vue';
import UserOperaion from './user/operation.vue';

const router = new VueRouter({
  mode: 'hash',
  routes: [{
      path: '/',
      redirect: '/info'
    },
    {
      path: '/info',
      name: '用户信息',
      component: UserInfo,
    }, {
      path: '/operation',
      name: '操作记录',
      component: UserOperaion
    }
  ]
});

export default router;