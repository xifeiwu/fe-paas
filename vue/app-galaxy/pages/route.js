var path = require('path');
import Login from './login.vue';
import Profile from './profile.vue';
import AppMain from './profile/app/main.vue';
import InstanceList from './profile/instance_list.vue';
import AppAdd from './profile/app/add.vue';
// import AddAppStep1 from './profile/add_app/step1.vue';
// import AddAppStep2 from './profile/add_app/step2.vue';
// import AddAppStep3 from './profile/add_app/step3.vue';
import ServiceMain from './profile/service/main.vue';
import DomainName from './profile/domain_name.vue';

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
      redirect: '/profile/app',
      children: [{
        path: 'app',
        name: '应用管理',
        component: AppMain,
      }, {
        path: 'app/add',
        name: '创建应用',
        component: AppAdd,
        // redirect: '/profile/app/add/step1',
        // children: [{
        //   path: 'step1',
        //   component: AddAppStep1,
        //   name: '创建应用',
        // },{
        //   path: 'step2',
        //   component: AddAppStep2,
        //   name: '创建应用',
        // },{
        //   path: 'step3',
        //   component: AddAppStep3,
        //   name: '创建应用',
        // }]
      }, {
        path: 'instance_list',
        name: '实例列表',
        component: InstanceList,
      }, {
        path: 'service',
        name: '服务管理',
        component: ServiceMain,
      }, {
        path: 'domain_name',
        name: '外网域名',
        component: DomainName,
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

  /**
   * traverse router config tree to add routerPath to all component:
   * routerPath = parent.path + path
   * @param path
   * @param component
   */
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

  /**
   * get all routerPath in router config tree, used to:
   * 1. check whether current url is validate.
   */
  getAllRouterPath() {
    var routerPath = [];
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath')) {
        routerPath.push(item.routerPath);
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            updateItem.call(this, item);
            if ('children' in item) {
              traverseComponent(item.children);
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          updateItem.call(this, item);
        }
        return null;
      }
    }
    traverseComponent(this.componentList);
    return routerPath;
  },


  /**
   * get routerPath to name, in the following format:
   * {
   *   '/login': "登录",
   *   '/profile':"详情",
   *   '/profile/app':"应用管理",
   *   '/profile/app/add':"创建应用",
   *   '/profile/domain_name':"外网域名",
   *   '/profile/instance_list':"实例列表",
   *   '/profile/service':"服务管理"
   *  }
   */
  getRouterPathToName() {
    var routerPath = {};
    function updateItem(item) {
      if (item.hasOwnProperty('routerPath') && item.hasOwnProperty('name')) {
        if (item.name && item.routerPath) {
          routerPath[item.routerPath] = item.name;
        }
      }
    }
    function traverseComponent(component) {
      if ('object' === typeof(component)) {
        for (let key in component) {
          if (component.hasOwnProperty(key)) {
            let item = component[key];
            updateItem.call(this, item);
            if ('children' in item) {
              traverseComponent(item.children);
            }
          }
        }
        return null;
      } else if (Array.isArray(component)) {
        for (let key in component) {
          let item = component[key];
          updateItem.call(this, item);
        }
        return null;
      }
    }
    traverseComponent(this.componentList);
    return routerPath;
  },

  /**
   * get component name by routerPath.
   */
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
  },
}

var router = new Router();
// console.log(JSON.stringify(router.componentList));
export default router;