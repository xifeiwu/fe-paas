/**
 * Created by xifei.wu on 2017/12/4.
 */
import Vue from 'vue';
// let NetData = Vue.prototype.$net;
import NetData from '../../net/net';
const USE_LOCAL_STORAGE = false;

const warning = function(prop, where) {
  console.log(`warning: get ${prop} from ${where}`);
};
const stateHasUpdated = function(prop) {
  let hasUpdated = false;
  if ('object' === typeof(prop) && Object.keys(prop).length > 0) {
    hasUpdated = true;
  } else if (Array.isArray(prop) && prop.length > 0) {
    hasUpdated = true;
  }
  return hasUpdated;
}

const getValue = function({state, getters}, prop) {
  let result = null;
  if (stateHasUpdated(state[prop])) {
    result = state[prop];
  } else if (USE_LOCAL_STORAGE) {
    warning(prop, 'localStorage');
    let local = JSON.parse(localStorage.getItem('user/' + prop));
    if (local) {
      result = local;
    }
  }
  return result;
}

/**
 * the property write to and read from localStorage by default:
 * 1. config, save user config, such as selected appID in page service
 * 2. menuList, got from the response of login
 *
 * the properties save on vuex
 * 1. groupList, only refresh at the beginning of page profile.vue
 * 2. profileListOfGroup, only refresh at the beginning of page profile.vue
 * 3. appInfoListOfGroup, only refresh at the beginning of page profile.vue
 */
const state = {
  /* net data */
  // 用户配置相关信息
  config: JSON.parse(localStorage.getItem('user/config')),
  // 侧边栏
  menuList: JSON.parse(localStorage.getItem('user/menuList')),
  // 用户所属组列表
  groupList: [],
  // 当前组
  groupID: null,
  // 当前组的所有开发环境
  profileListOfGroup: [],
  // 当前做的所有APP列表
  appInfoListOfGroup: [],
};

const actions = {
  login({commit, state}, res) {
    if (0 === state.menuList.length) {
      warning('login', 'netwrok');
      NetData.login(res).then((menuList) => {
        commit('LOGIN', menuList);
      })
    }
  },

  /**
   * 获取用户所属组列表
   */
  getGroupList({commit, state}) {
    if (0 === state.groupList.length) {
      warning('getGroupList', 'netwrok');
      NetData.getGroupList().then(content => {
        if (content.hasOwnProperty('groupList')) {
          commit('SET_GROUP_LIST', content.groupList);
        }
      });
    }
  },

  /**
   * save some config value to localStorage
   * format:
   * setConfig('profile/service/appID', 3);
   */
  setConfig({commit, state}, {keys, value}) {
    if (!keys || 0 === keys.length) {
      return;
    }
    if (null == state.config) {
      state.config = {};
    }
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      state.config[prop] = value;
    } else {
      let tmpValue = state.config;
      keyList.slice(0, lastKeyIndex).forEach(it => {
        if (!tmpValue.hasOwnProperty(it)) {
          tmpValue[it] = {};
        }
        tmpValue = tmpValue[it];
      });
      tmpValue[prop] = value;
    }
    localStorage.setItem('user/config', JSON.stringify(state.config));
  },
  /**
   * 更改用户组ID
   */
  groupID({commit, state, dispatch}, {from, value}) {
    state.groupID = value;
    localStorage.setItem('groupID', value);
    dispatch('getProfileListOfGroup', {
      id: value
    });
    dispatch('getAppListByGroupID', {
      groupID: value
    });
    // dispatch('app/getAppListByGroupID', {
    //   id: id
    // }, {root: true});
  },

  /**
   * 获取当前组所有profile
   */
  getProfileListOfGroup({commit, state}, options) {
    NetData.getProfileListOfGroup(options).then(content => {
      if (content.hasOwnProperty('spaceList')) {
        commit('SET_PROFILE_OF_GROUP', content.spaceList);
      }
    });
  },

  /**
   * 获取该groupID下的所有app
   * @param commit
   * @param state
   * @param groupID
   */
  getAppListByGroupID({commit, state}, {groupID, from}) {
    NetData.getAPPList({
      groupId: groupID,
      serviceName: ''
    }).then(content => {
      // console.log(content);
      // if (content.hasOwnProperty('appList')) {
        commit('SET_APP_INFO_LIST_OF_GROUP', content);
      // }
    });
  }
};

const mutations = {
  /* net state */
  LOGIN(state, groupList) {
    state.menuList = groupList;
    localStorage.setItem('user/menuList', JSON.stringify(groupList));
  },

  SET_GROUP_LIST(state, groupList) {
    state.groupList = groupList;
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('user/groupList', JSON.stringify(groupList));
    }
  },

  SET_PROFILE_OF_GROUP(state, profileList) {
    state.profileListOfGroup = profileList;
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('user/profileListOfGroup', JSON.stringify(profileList));
    }
  },

  SET_APP_INFO_LIST_OF_GROUP(state, appList) {
    state.appInfoListOfGroup = appList;
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('user/appInfoListOfGroup', JSON.stringify(appList));
    }
  }
}

const getters = {
  'menuList': (state, getters) => {
    let menuList = state.menuList;
    return menuList;
  },
  'config': (state, getters) => {
    let config = state.config;
    return config;
  },
  'groupID': (state, getters) => {
    let groupID = state.groupID;
    if (null === groupID) {
      groupID = localStorage.getItem('groupID');
    }
    if (null === groupID && state.groupList.length > 0) {
      groupID = state.groupList[0].id
    }
    return parseInt(groupID);
  },
  'groupList': (state, getters) => {
    let result = null;
    if (Array.isArray(state.groupList) && state.groupList.length > 0) {
      result = state.groupList;
    } else if (USE_LOCAL_STORAGE) {
      warning('groupList', 'localStorage');
      let local = JSON.parse(localStorage.getItem('user/groupList'));
      if (local) {
        result = local;
      }
    }
    return result;
  },
  'profileListOfGroup': (state, getters) => {
    let result = null;
    if (stateHasUpdated(state.profileListOfGroup)) {
      result = state.profileListOfGroup;
    } else if (USE_LOCAL_STORAGE) {
      warning('groupList', 'localStorage');
      let local = JSON.parse(localStorage.getItem('user/profileListOfGroup'));
      if (local) {
        result = local;
      }
    }
    return result;
  },

  'appInfoListOfGroup': (state, getters) => {
    return getValue({state, getters}, 'appInfoListOfGroup');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}