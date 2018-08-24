import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lobList: [],        // toasts,
    groupList: [],
  },
  actions: {
    lobList({ commit, state }, lobList) {
      state.lobList = lobList;
    },
    groupList({commit, state }, groupList) {
      state.groupList = groupList;
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
    'groupList': (state, getters) => {
      return state.groupList;
    }
  },

  // modules:{
  //   user, app, tmp, global, etc, cdn
  // },
  // plugins: [createPersistedState({
  //   key: 'manage',
  //   // 暂时只持久化 etc 模块，防止冲突
  //   paths: ['config',
  //     'user.groupInfo', 'user.groupList', 'user.profileListOfGroup',
  //     'app.messageForCreateAPP', 'etc'],
  // })]
})