/**
 * Created by xifei.wu on 2017/11/28.
 */
import Login from './pages/login.vue'
import Profile from './pages/profile.vue'

const load = function(name) {
  return function(r) {
    require.ensure(
      [],
      function () {
        r(require(`./pages/${name}.vue`))
      }
    )
  }
}

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
    component: Login
  };
  let profileRoute = {
    path: '/profile',
    name: 'profile',
    component: Profile
  };

  return [indexRoute, profileRoute];
};

let routeConfig = [];
routeConfig = routeConfig.concat(generateMiscRoutes());

// routeConfig.push({
//   path: '/play',
//   name: 'play',
//   component: Login
// });

export default routeConfig