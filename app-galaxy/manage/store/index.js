import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lobList: [],
    scrumList: [],
    groupListAll: [],
    profileListAll: [],
    config: {},
  },
  actions: {
    lobList({ commit, state }, lobList) {
      state.lobList = lobList;
    },
    scrumList({ commit, state }, scrumList) {
      state.scrumList = scrumList;
    },
    groupListAll({commit, state }, groupListAll) {
      state.groupListAll = groupListAll;
    },
    profileListAll({commit, state }, profileListAll) {
      state.profileListAll = profileListAll;
    },
    setConfig({commit}, config) {
      commit('SET_CONFIG', config)
    },
    SET_CONFIG(state, config) {
      if (!state.config) {
        state.config = {};
      }
      for (let key in config) {
        // localStorage will not update if code run in the following way
        Vue.set(state.config, key, config[key]);
      }
    }
  },
  mutations: {
    toastPush(state, payload) {
      state.toasts.push(payload)
    },
    toastPop(state) {
      state.toasts.splice(0, 1)
    },
    SET_CONFIG(state, config) {
      if (!state.config) {
        state.config = {};
      }
      for (let key in config) {
        // localStorage will not update if code run in the following way
        Vue.set(state.config, key, config[key]);
      }
    }
  },

  getters: {
    'lobList': (state, getters) => {
      return state.lobList;
    },
    'scrumList': (state, getters) => {
      return state.scrumList;
    },
    'groupListAll': (state, getters) => {
      return state.groupListAll;
    },
    'profileListAll': (state, getters) => {
      return state.profileListAll;
    },
    'collapseMenu': (state, getters) => {
      if (!state.config) {
        state.config = {}
      }
      return state.config.collapseMenu;
    }
  },

  // modules:{
  //   user, app, tmp, global, etc, cdn
  // },
  plugins: [createPersistedState({
    key: 'manage',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['config'],
  })]
})
