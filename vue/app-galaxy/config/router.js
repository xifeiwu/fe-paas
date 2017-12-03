/**
 * Created by xifei.wu on 2017/11/28.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../pages/login.vue'
import Profile from '../pages/profile.vue'

// const load = function(path) {
//   return function(r) {
//     require.ensure(
//       [],
//       function() {
//         r(require(path))
//       }
//     )
//   }
// }

const generateMiscRoutes = function() {
  // let guideRoute = {
  //   path: `/guide`, // 指南
  //   redirect: `/guide/design`,
  //   component: load('guide'),
  //   children: [{
  //     path: 'design', // 设计原则
  //     name: 'guide-design',
  //     component: load('design')
  //   }, {
  //     path: 'nav', // 导航
  //     name: 'guide-nav',
  //     component: load('nav')
  //   }]
  // };
  //
  // let resourceRoute = {
  //   path: `/resource`, // 资源
  //   name: 'resource',
  //   component: load('resource')
  // };
  let indexRoute = {
    path: '/login',
    name: 'login',
    component: require('../pages/login.vue').default
  };
  let profileRoute = {
    path: '/profile',
    name: 'profile',
    component: require('../pages/profile.vue').default,
    children: [{
      path: 'app_manager',
      name: 'app_manager',
      component: require('../pages/profile/app_manager.vue').default
    }]
  };

  return [indexRoute, profileRoute];
};

let routeConfig = [];
routeConfig = routeConfig.concat(generateMiscRoutes());

Vue.use(VueRouter);
const vueRouter = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: routeConfig
});
// export function fetch(url, params = {}) {
//  return new Promise((resolve, reject) => {
//   axios.get(url, {
//     params: params
//    })
//    .then(response => {
//     resolve(response.data);
//    })
//    .catch(err => {
//     reject(err)
//    })
//  })
// }

vueRouter.beforeEach((to, from, next) => {
  console.log('in beforeEach');
  console.log(to + ' -> ' + from);
  next();
  //  if (to.meta.requireAuth) {
  //   fetch('m/is/login').then(res = > {
  //    if (res.errCode == 200) {
  //     next();
  //    } else {
  //     if (getCookie('session')) {
  //      delCookie('session');
  //     }
  //     if (getCookie('u_uuid')) {
  //      delCookie('u_uuid');
  //     }
  //     next({
  //      path: '/'
  //     });
  //    }
  //   });
  //  } else {
  //   next();
  //  }
});


export default vueRouter;
// export default routeConfig