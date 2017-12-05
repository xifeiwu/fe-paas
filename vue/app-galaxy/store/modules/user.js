/**
 * Created by xifei.wu on 2017/12/4.
 */
import NetData from '../../data';
const USE_LOCAL_STORAGE = true;

const warning = function(prop, where) {
  console.log(`warning: get ${prop} from ${where}`);
};

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
    } else if (USE_LOCAL_STORAGE) {
      warning('menuList', 'localStorage');
      let local = JSON.parse(localStorage.getItem('user/menuList'));
      if (local) {
        result = local;
      }
    }
    return result;
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