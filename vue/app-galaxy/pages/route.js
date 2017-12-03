var path = require('path');

var componentList = {
  'login': {
    path: '/login',
    name: '登录',
    componentFile: 'login.vue'
    // component: getAbsPath('loing.vue')
  },
  'profile': {
    path: '/profile',
    name: '详情',
    componentFile: 'profile.vue',
    // component: getAbsPath('profile.vue')
    children: [{
      path: '/app_manager',
      name: '应用管理',
      componentFile: 'app_manager.vue'
      // component: getAbsPath('app_manager.vue')
    }]
  }
}

function traverseComponent(parentPath, component) {
  function getAbsPath(file) {
    return path.resolve(__dirname, file);
  }
  function removeVirgule(path) {
    return path.substr(1);
  }
  for (let key in component) {
    if (component.hasOwnProperty(key)) {
      let item = component[key];
      if (null !== parentPath) {
        item.componentPath = parentPath + item.path;
      } else {
        item.componentPath = getAbsPath(removeVirgule(item.path));
      }
      // item.componentPath = getAbsPath(removeVirgule(item.path));
      if ('children' in item) {
        traverseComponent(item.componentPath, item.children);
      }
    }
  }
}

traverseComponent(null, componentList);
// console.log(JSON.stringify(componentList));

export default componentList;