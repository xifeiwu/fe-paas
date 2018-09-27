/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import app from './modules/app';
import tmp from './modules/tmp';
import etc from './modules/etc';
import cdn from './modules/cdn';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    toasts: [],        // toasts,
    config: {},
    screen: {
      width: 0,
      height: 0,
      size: 0,
      ratioHeight: 0
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
    }
  },
  actions: {
    setScreenSize({state, commit}, {width, height}) {
      state.screen.width = width;
      state.screen.height = height;
      try {
        state.screen.ratioHeight = height / window.devicePixelRatio;
      } catch(err) {
        state.screen.ratioHeight = 500
      }
      state.screen.size = width * height;
    },
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
    }
  },

  getters: {
    'collapseMenu': (state, getters) => {
      if (!state.config) {
        state.config = {}
      }
      return state.config.collapseMenu;
    },
    'screen': (state) => {
      return state.screen;
    }
  },

  modules:{
    user, app, tmp, etc, cdn
  },
  plugins: [createPersistedState({
    key: 'profile',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['config',
      'user.groupInfo', 'user.groupList', 'user.profileListOfGroup', 'user.config',
      'app.messageForCreateAPP', 'etc'],
    // filter: (mutation) => {console.log(mutation)}
  })]
})
