/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import etc from './modules/etc';
import k8s from './modules/k8s';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {},
  },
  actions: {
    setConfig({commit}, config) {
      commit('SET_CONFIG', config)
    }
  },
  mutations: {
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
    'visitPageCount': (state, getters) => {
      if (!state.config) {
        state.config = {}
      }
      if (!state.config.visitPageCount) {
        state.config.visitPageCount = 0;
      }
      return state.config.visitPageCount;
    }
  },

  modules: {
    etc, k8s
  },
  plugins: [createPersistedState({
    key: 'user',
    paths: ['config', 'etc.groupList'],
    // filter: (mutation) => {console.log(mutation)}
  })]
})