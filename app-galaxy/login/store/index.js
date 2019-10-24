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
    updateUserInfo ({ commit, state }, userInfo) {
      commit('SET_USER_INFO', userInfo)
    },
  },
  mutations: {
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
