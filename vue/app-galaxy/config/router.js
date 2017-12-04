/**
 * Created by xifei.wu on 2017/11/28.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import componentConfig from '../pages/route';

// const load = function(path) {
//   return function(r) {
//     require.ensure(
//       [],
//       function() {
//         r(require(path))
//       },
//       'bundle'
//     )
//   }
// }

// let load = path => {
//   return r => require.ensure([], () =>
//       r(require(path)),
//     'en-US');

let load = function(pathInPages) {
  return require(`../pages/${pathInPages}.vue`).default;
}

function traverseComponent(component, vueComConfig) {
  function generateItem(item) {
    let keysMap = {
      path: 'path',
      name: 'name',
      redirect: 'redirect',
      componentFile: 'component',
      meta: 'meta'
    };
    let result = {};
    for (let key in item) {
      if (item.hasOwnProperty(key) && key in keysMap) {
        if ('componentFile' === key) {
          result[keysMap[key]] = load(item[key]);
        } else {
          result[keysMap[key]] = item[key];
        }
      }
    }
    return result;
  }
  if ('object' === typeof(component)) {
    for (let key in component) {
      if (component.hasOwnProperty(key)) {
        let item = component[key];
        vueComConfig[key] = generateItem.call(this, item);
        if ('children' in item) {
          vueComConfig[key].children = [];
          traverseComponent(item.children, vueComConfig[key].children);
        }
      }
    }
  } else if (Array.isArray(component)){
    vueComConfig = component.map(generateItem.bind(this));
  }
}

const generateMiscRoutes = function() {
  // var kk = '../pages/login.vue';
  var kk = 'login.vue';
  let indexRoute = {
    path: '/login',
    name: 'login',
    component: require(`../pages/${kk}`).default,
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
  let routeConfig = [indexRoute, profileRoute];
  console.log(routeConfig);

  // console.log(componentConfig);
  let vueRouteConfig = {};
  traverseComponent(componentConfig, vueRouteConfig);
  // console.log(vueRouteConfig);
  let configList = []
  for (let key in vueRouteConfig) {
    configList.push(vueRouteConfig[key]);
  }
  return configList;
};

let routeConfig = generateMiscRoutes();

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
