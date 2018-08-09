/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import global from '$assets/js/store/modules/global';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    menuList: [],
    userInfo: {},
  },
  mutations: {
    SET_MENUS(state, menuList) {
      state.menuList = menuList;
    },
    SET_USER_INFO(state, userInfo) {
      if (!userInfo) {
        state.userInfo = {};
      } else {
        for (let key in userInfo) {
          // localStorage will not update if code run in the following way
          // state.info[key] = userInfo[key];
          Vue.set(state.userInfo, key, userInfo[key]);
        }
      }
    }
  },
  actions: {
    addMenuList ({ commit, state }, menuList) {
      if (Array.isArray(menuList) && menuList.length > 0) {
        commit('SET_MENUS', menuList)
      }
    },
    updateUserInfo ({ commit, state }, userInfo) {
      commit('SET_USER_INFO', userInfo)
    },
  },
  modules:{
    global
  },
  plugins: [createPersistedState({
    key: 'login',
    // 暂时只持久化 etc 模块，防止冲突
    // paths: ['']
  })]
})
