/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    menuList: [],        // toasts
  },
  mutations: {
    SET_MENUS(state, menuList) {
      state.menuList = menuList;
    }
  },
  actions: {
    addMenuList ({ commit, state }, menuList) {
      if (Array.isArray(menus) && menus.length) {
        commit('SET_MENUS', menuList)
      }
    },
  },
  // modules:{
  //   user, app, tmp, global, etc, cdn
  // },
  plugins: [createPersistedState({
    key: 'login',
    // 暂时只持久化 etc 模块，防止冲突
    // paths: ['etc']
  })]
})
