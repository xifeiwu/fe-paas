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
    navMenu: {},
    menuList: [],
    userInfo: {},
  },
  mutations: {
    SET_NAV_MENU(state, navMenu) {
      state.navMenu = {};
      if (navMenu) {
        for (let key in navMenu) {
          // localStorage will not update if code run in the following way
          // state.info[key] = userInfo[key];
          Vue.set(state.navMenu, key, navMenu[key]);
        }
      }
    },
    SET_MENUS_LIST(state, menuList) {
      state.menuList = menuList;
    },
    SET_USER_INFO(state, userInfo) {
      if (!userInfo) {
        state.userInfo = {};
      } else {
        if (!state.userInfo) {
          state.userInfo = {};
        }
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
        commit('SET_MENUS_LIST', menuList)
      }
    },
    saveNavMenu ({ commit, state }, navMenu) {
      commit('SET_NAV_MENU', navMenu)
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
    paths: ['navMenu', 'menuList', 'userInfo']
  })]
})
