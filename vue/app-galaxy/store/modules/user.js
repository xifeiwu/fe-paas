/**
 * Created by xifei.wu on 2017/12/4.
 */
import Vue from 'vue';
// let NetData = Vue.prototype.$net;
import NetData from '../../net/net';
const USE_LOCAL_STORAGE = true;

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

const state = {
  /* net data */
  // 侧边栏
  menuList: [],
  // 当前组
  groupID: null,
  // 当前组的所有开发环境
  profileListOfGroup: [],
  // 用户所属组列表
  groupList: [],
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
   * 更改用户组ID
   */
  groupID({commit, state, dispatch}, id) {
    state.groupID = id;
    localStorage.setItem('groupID', id);
    dispatch('getProfileListOfGroup', {
      id: id
    });
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
};

const mutations = {
  /* net state */
  LOGIN(state, groupList) {
    state.menuList = groupList;
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('user/menuList', JSON.stringify(groupList));
    }
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
  }
}

const getters = {
  'menuList': (state, getters) => {
    let result = null;
    if (Array.isArray(state.menuList) && state.menuList.length > 0) {
      result = state.menuList;
    } else if (USE_LOCAL_STORAGE) {
      warning('menuList', 'localStorage');
      let local = JSON.parse(localStorage.getItem('user/menuList'));
      if (local) {
        result = local;
      }
    }
    return result;
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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}