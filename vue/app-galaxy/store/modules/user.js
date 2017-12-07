/**
 * Created by xifei.wu on 2017/12/4.
 */
import Vue from 'vue';
// let NetData = Vue.prototype.$net;
import NetData from '../../data/net';
const USE_LOCAL_STORAGE = true;

const warning = function(prop, where) {
  console.log(`warning: get ${prop} from ${where}`);
};

const state = {
  Login: 0,
  menuList: [],
  groupID: '',
  groupList: [],
};

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
    let groupID = localStorage.getItem('groupID');
    if (!groupID && state.groupList.length > 0) {
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
  }
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
  groupID({commit, state, dispatch}, id) {
    state.groupID = id;
    localStorage.setItem('groupID', id);
    dispatch('app/getProfileOfGroup', {
      id: id
    }, {root: true});
  },
  getGroupList({commit, state}) {
    if (0 === state.groupList.length) {
      warning('getGroupList', 'netwrok');
      NetData.getGroupList().then(content => {
        if (content.hasOwnProperty('groupList')) {
          commit('SET_GROUP_LIST', content.groupList);
        }
      });
    }
  }
};

const mutations = {
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}