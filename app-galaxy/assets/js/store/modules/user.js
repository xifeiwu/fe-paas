import Vue from 'vue';

export default {
  namespaced: true,
  state: {
    config: {},
    groupInfo: {},
    // format: {page: permission}
    permission: {},
  },
  actions: {
    setUserGroupList({state, commit}, groupList) {
      state.userGroupList = groupList;
    },
    setGroupInfo({state, commit}, groupList) {
      commit('SET_GROUP_INFO', groupList)
    },
    clear({state, commit}) {
      state.config = {};
      state.groupInfo = {};
      state.permission = {};
    }
  },
  mutations: {
    SET_GROUP_INFO(state, groupInfo) {
      state.groupInfo = groupInfo;
    },
    SET_PERMISSION(state, permission) {
      // Vue.set(state.permission, key, config[key]);
      state.permission = Object.assign(state.permission, permission);
    },
    CLEAR(state) {
    }
  },

  getters: {
    'groupInfo': (state, getters) => {
      return state.groupInfo;
    },
    'permission': (state, getters) => {
      return state.permission
    }
  }
}