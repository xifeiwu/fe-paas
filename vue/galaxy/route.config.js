/**
 * Created by xifei.wu on 2017/11/28.
 */
import Login2 from './pages/login_2.vue'

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
    path: '/', // 首页
    name: 'home',
    component: load('login_2.vue')
  };

  return [indexRoute];
};

let routeConfig = [];
// routeConfig.push(generateMiscRoutes());
routeConfig.push({
  path: '/play',
  name: 'play',
  component: Login2
});

export default routeConfig