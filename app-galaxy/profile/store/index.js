/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import app from './modules/app';
import tmp from './modules/tmp';
import global from '$assets/js/store/modules/global';
import etc from './modules/etc';
import cdn from './modules/cdn';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    toasts: [],        // toasts
  },
  mutations: {
    toastPush(state, payload) {
      state.toasts.push(payload)
    },
    toastPop(state) {
      state.toasts.splice(0, 1)
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
  },
  modules:{
    user, app, tmp, global, etc, cdn
  },
  plugins: [createPersistedState({
    key: 'galaxy',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['etc']
  })]
})
