/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import app from './modules/app';
import tmp from './modules/tmp';
import cdn from './modules/cdn';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    constants: {
      navMenuWidth: 190,
    },
    toasts: [],        // toasts,
    config: {
      collapseMenu: false
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
    },
    CLEAR(state) {
    },
  },
  actions: {
    toastPush({ commit }, payload) {
      const _payload = Object.assign({ title: '', center: true, druing: 4000 }, payload);
      commit('toastPush', _payload);
      setTimeout(() => {
        commit('toastPop')
      }, _payload.druing)
    },
    setConfig({commit}, config) {
      commit('SET_CONFIG', config)
    },
    logout({dispatch, state, commit}) {
      dispatch('user/clear');
      commit('CLEAR');
    },
  },

  getters: {
    'collapseMenu': (state, getters) => {
      if (!state.config) {
        state.config = {}
      }
      return state.config.collapseMenu;
    },
    navMenuWidth(state, getters) {
      if (state.config.collapseMenu) {
        return 56;
      } else {
        return 190;
      }
    }
  },

  modules:{
    user, app, tmp, cdn
  },
  plugins: [createPersistedState({
    key: 'profile',
    paths: ['config',
      'user.groupInfo', 'user.groupList', 'user.profileListOfGroup', 'user.config',
      'app.globalConfig'],
    // filter: (mutation) => {console.log(mutation)}
  })]
})
