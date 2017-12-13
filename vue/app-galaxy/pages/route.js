var path = require('path');
import Login from './login.vue';
import Profile from './profile.vue';
import AppManager from './profile/app_manager.vue';
import InstanceList from './profile/instance_list.vue';
import AddApp from './profile/add_app';
import AddAppStep1 from './profile/add_app/step1.vue';
import AddAppStep2 from './profile/add_app/step2.vue';
import AddAppStep3 from './profile/add_app/step3.vue';

/**
 * router config:
 * 1. path should have the same name as .vue file
 * 2. as limited by webpack require context, componentFile is the path under dir ../pages
 */
var Router = function () {
  this.componentList = {
    'login': {
      path: '/login',
      name: '登录',
      component: Login,
    },
    'profile': {
      path: '/profile',
      name: '详情',
      component: Profile,
      redirect: '/profile/app_manager',
      children: [{
        path: 'app_manager',
        name: '应用管理',
        component: AppManager,
      }, {
        path: 'instance_list',
        name: '实例列表',
        component: InstanceList,
      }, {
        path: 'add_app',
        name: '创建应用',
        component: AddApp,
        redirect: '/profile/add_app/step1',
        children: [{
          path: 'step1',
          component: AddAppStep1,
          name: '创建应用',
        },{
          path: 'step2',
          component: AddAppStep2,
          name: '创建应用',
        },{
          path: 'step3',
          component: AddAppStep3,
          name: '创建应用',
        },{
          path: 'finish',
        }]
      }]
    }
  }
  this.update();
};

Router.prototype = {
  /* not used*/
  getAbsPath(file) {
    // let gpath = path.resolve(__dirname, file);
    let path = '../pages/' + file;
    return path;
  },

  removeVirgule(path) {
    return path.substr(1);
  },

  generateRouterLinkPath(path, component) {
    function updateItem(item) {
      if (null !== path) {
        item.routerPath = path + '/' + item.path;
      } else {
        item.routerPath = item.path;
      }
    }
    if ('object' === typeof(component)) {
      for (let key in component) {
        if (component.hasOwnProperty(key)) {
          let item = component[key];
          updateItem.call(this, item);
          if ('children' in item) {
            this.generateRouterLinkPath(item.routerPath, item.children);
          }
        }
      }
    } else if (Array.isArray(component)){
      component.forEach(updateItem.bind(this));
    }
  },

  generateComponentFile(component) {
    function updateItem(item) {
      // item.componentFile = this.getAbsPath(this.removeVirgule(item.routerPath)) + '.vue';
      // componentFile is the path under dir ../pages
      item.componentFile = this.removeVirgule(item.routerPath);
    }
    if ('object' === typeof(component)) {
      for (let key in component) {
        if (component.hasOwnProperty(key)) {
          let item = component[key];
          updateItem.call(this, item);
          if ('children' in item) {
            this.generateComponentFile(item.children);
          }
        }
      }
    } else if (Array.isArray(component)){
      component.forEach(updateItem.bind(this));
    }
  },

  update() {
    this.generateRouterLinkPath(null, this.componentList);
    this.generateComponentFile(this.componentList);
  },

  getNameByRouterPath(routerPath) {
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath') && routerPath === item.routerPath) {
        if (item.hasOwnProperty('name')) {
          return item.name;
        } else {
          return '';
        }
      } else {
        return null;
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            let name = updateItem.call(this, item);
            if (null !== name) {
              return name;
            }
            if ('children' in item) {
              let name = traverseComponent(item.children);
              if (null !== name) {
                return name;
              }
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          let name = updateItem.call(this, item);
          if (null !== name) {
            return name;
          }
        }
        return null;
      }
    }
    let name = traverseComponent(this.componentList);
    return name;
  }
}

var router = new Router();
// console.log(JSON.stringify(router.componentList));
export default router;