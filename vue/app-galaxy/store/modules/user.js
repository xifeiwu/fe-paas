/**
 * Created by xifei.wu on 2017/12/4.
 */
const DEBUG = true;

const state = {
  user: [{
    username: '11',
    password: '11'
  }, {
    username: '啊a',
    password: '啊啊'
  }, {
    username: '啊b',
    password: '啊啊'
  }, {
    username: '啊c',
    password: '啊啊'
  }],
  Login: 0,
  menuList: [],
  groupList: [],
};

const getters = {
  'menuList': (state, getters) => {
    let result = null;
    if (Array.isArray(state.menuList) && state.menuList.length > 0) {
      result = state.menuList;
    } else if (DEBUG) {
      let local = JSON.parse(localStorage.getItem('user/menuList'));
      if (local) {
        result = local;
      }
    }
    return result;
  },
  'groupList': (state, getters) => {
    return state.groupList;
  }
};

const actions = {
  getGroupList({commit, state}) {
    state.groupList = [{
      name: 'A'
    }, {
      name: 'B'
    }];
  }
};

const mutations = {
  LOGIN(state, res) {
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/profile/app_manager',
          icon: 'el-icon-location'
        },
        "服务管理": {
          router: '/profile/service_manager'
        },
        "审批管理": {
          router: '/profile/approve_manager'
        },
        "实例列表": {
          router: '/profile/instance_list'
        },
        "外网域名": {
          router: '/profile/domain_name'
        },
        "日志中心": {
          router: '/profile/log_center'
        },
        "应用监控": {
          router: '/profile/app_monitor'
        },
        "Oauth权限": {
          router: '/profile/oauth_privilege',
          icon: 'el-icon-setting'
        },
      }
      let key = item.name;
      if (keyMap.hasOwnProperty(key)) {
        let props = keyMap[key];
        for (let key in props) {
          item[key] = props[key];
        }
      }
      return item;
    }

    let twoLevelMenu = []
    let permission = res.permission;
    permission = permission.map(it => {
      return updateItem(it);
    })
    permission.forEach(it => {
      if (0 === it.parentId) {
        twoLevelMenu.push(it);
      }
    });
    permission.forEach(it => {
      if (0 !== it.parentId) {
        let findParent = twoLevelMenu.some(pItem => {
          if (it.parentId === pItem.id) {
            if (!pItem.hasOwnProperty('children')) {
              pItem.children = [];
            }
            pItem.children.push(it);
            return true;
          } else {
            return false;
          }
        });
        if (!findParent) {
          twoLevelMenu.push(it);
        }
      }
    });

    let oneLevelMenu = [];
    twoLevelMenu.forEach(it => {
      oneLevelMenu.push(it);
      if (it.hasOwnProperty('children')) {
        it.children.forEach(it2 => {
          oneLevelMenu.push(it2);
        })
      }
    });

    let results = oneLevelMenu;

    if (DEBUG) {
      localStorage.setItem('user/menuList', JSON.stringify(results));
    }
    state.menuList = results;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}