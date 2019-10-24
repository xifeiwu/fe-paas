import Vue from 'vue';

const validateCheck = function(state) {
  if (!state.menus) {
    state.menus = {};
  }
  if (state.menus.hasOwnProperty('profile')) {
    state.menus.profile = {};
  }
};

export default {
  namespaced: true,
  state: {
    config: {},
    groupInfo: {},
    // format: {page: permission}
    permission: {},
    userInfo: {},
    menus: {
      profile: {}
    }
  },
  actions: {
    permission({commit, state}, permission) {
      state.permission = permission;
    },
    setUserGroupList({state, commit}, groupList) {
      state.userGroupList = groupList;
    },
    setGroupInfo({state, commit}, groupList) {
      commit('SET_GROUP_INFO', groupList)
    },
    setUserInfo({state, commit}, userInfo) {
      commit('SET_USER_INFO', userInfo)
    },
    // format of menuConfig: {profile: {}}
    updateMenus({state, commit}, menuConfig) {
      validateCheck(state);
      for (let key in menuConfig) {
        Vue.set(state.menus, key, menuConfig[key]);
      }
    },
    clear({state, commit}) {
      state.config = {};
      state.groupInfo = {};
      state.userInfo = {};
      state.permission = {};
    }
  },
  mutations: {
    SET_GROUP_INFO(state, groupInfo) {
      state.groupInfo = groupInfo;
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },
    CLEAR(state) {
    }
  },

  getters: {
    'groupInfo': (state, getters) => {
      return state.groupInfo;
    },
    'userInfo': (state, getters) => {
      return state.userInfo;
    },
    'permission': (state, getters) => {
      return state.permission
    },
    'menus': (state, getters) => {
      return state.menus
    }
  }
}