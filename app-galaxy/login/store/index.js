/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import globalStore from 'assets/js/store';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    navMenu: {},
    menuList: [],
    userInfo: {},
  },
  actions: {
    // addMenuList ({ commit, state }, menuList) {
    //   if (Array.isArray(menuList) && menuList.length > 0) {
    //     commit('SET_MENUS_LIST', menuList)
    //   }
    // },
    saveNavMenu ({ commit, state }, navMenu) {
      commit('SET_NAV_MENU', navMenu)
    },
    updateUserInfo ({ commit, state }, userInfo) {
      commit('SET_USER_INFO', userInfo)
    },
  },
  mutations: {
    // SET_MENUS_LIST(state, menuList) {
    //   state.menuList = menuList;
    // },
    SET_NAV_MENU(state, navMenu) {
      state.navMenu = navMenu;
      globalStore.dispatch('user/updateMenus', {
        'profile': navMenu
      });
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
      globalStore.dispatch('user/setUserInfo', state.userInfo);
    }
  },
  modules:{
  },
})
